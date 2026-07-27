"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, GripVertical, Star, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploaderProps {
  /** Current list of image URLs */
  value: string[];
  /** Called whenever the list changes (upload, delete, reorder, cover change) */
  onChange: (urls: string[]) => void;
  /** Upload folder (e.g. "properties" or "blog") */
  folder?: string;
  /** Min number of photos required (default 3) */
  min?: number;
  /** Max number of photos allowed (default 50) */
  max?: number;
  /**
   * Upload API endpoint. Defaults to "/api/admin/upload" (admin portal).
   * Agent portal should pass "/api/agent/upload" — that route uses
   * requireAgent() instead of requireAdmin() so agent sessions aren't
   * rejected with 401.
   */
  endpoint?: string;
  /**
   * Optional property ID — when editing an existing property, agents should
   * pass the property ID so the upload route can verify ownership before
   * storing the file. Ignored if not provided (e.g. when creating a new
   * property where the ID doesn't exist yet).
   */
  propertyId?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export function PhotoUploader({
  value,
  onChange,
  folder = "properties",
  min = 3,
  max = 50,
  endpoint = "/api/admin/upload",
  propertyId,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // First image in the array is always the cover
  const coverUrl = value[0];

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);

    // Validate count
    if (value.length + files.length > max) {
      toast.error(`Maximum ${max} photos allowed. You already have ${value.length}.`);
      return;
    }

    // Pre-validate all files
    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format. Use JPG, PNG, or WEBP.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" is too large. Max 8MB per file.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add to uploading list
    const uploadingEntries: UploadingFile[] = validFiles.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      progress: 0,
    }));
    setUploading(uploadingEntries);

    // Upload all files in parallel
    const uploadPromises = validFiles.map(async (file, idx) => {
      const entry = uploadingEntries[idx];
      try {
        // Simulate progress while uploading (XHR would give real progress, fetch doesn't)
        const progressInterval = setInterval(() => {
          setUploading((prev) =>
            prev.map((u) =>
              u.id === entry.id ? { ...u, progress: Math.min(90, u.progress + 10) } : u,
            ),
          );
        }, 200);

        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", folder);
        if (propertyId) {
          formData.append("propertyId", propertyId);
        }

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        const data = await res.json();
        const newUrl = data.files[0].url;

        // Mark as complete
        setUploading((prev) =>
          prev.map((u) => (u.id === entry.id ? { ...u, progress: 100 } : u)),
        );

        return newUrl;
      } catch (e: any) {
        setUploading((prev) =>
          prev.map((u) =>
            u.id === entry.id ? { ...u, error: e.message || "Failed" } : u,
          ),
        );
        toast.error(`Failed to upload "${file.name}"`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter((u): u is string => !!u);

    // Remove completed uploads from the uploading list (after a brief delay so user sees 100%)
    setTimeout(() => {
      setUploading((prev) => prev.filter((u) => u.error));
    }, 600);

    if (successfulUrls.length > 0) {
      onChange([...value, ...successfulUrls]);
      toast.success(`${successfulUrls.length} photo(s) uploaded`);
    }
  }, [value, folder, max, onChange]);

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Delete a photo
  const handleDelete = (index: number) => {
    const url = value[index];
    if (index === 0 && value.length > 1) {
      toast("Cover photo changed — first remaining image is now the cover", { icon: "📷" });
    }
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  // Reorder: move image from `from` to `to`
  const handleReorder = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    if (from === 0 || to === 0) {
      toast("Cover photo updated", { icon: "⭐" });
    }
  };

  // Make a specific image the cover (move it to index 0)
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    handleReorder(index, 0);
  };

  // Drag state for reordering thumbnails
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleThumbDragStart = (index: number) => setDraggedIndex(index);
  const handleThumbDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    handleReorder(draggedIndex, index);
    setDraggedIndex(index);
  };
  const handleThumbDragEnd = () => setDraggedIndex(null);

  const remaining = Math.max(0, min - value.length);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragging
            ? "border-[#C9A961] bg-[#C9A961]/10 scale-[1.01]"
            : "border-border hover:border-[#C9A961] hover:bg-[#F9FAFB]"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = ""; // reset so same file can be re-selected
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`size-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-[#C9A961] text-white" : "bg-[#C9A961]/15 text-[#A68A3F]"}`}>
            {isDragging ? <Upload className="size-6 animate-bounce" /> : <ImageIcon className="size-6" />}
          </div>
          <div>
            <p className="font-medium text-[#0A1F44] text-sm">
              {isDragging ? "Drop photos here" : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or WEBP · Max 8MB per file · Min {min}, Max {max} photos
            </p>
          </div>
        </div>
      </div>

      {/* Min photos warning */}
      {value.length < min && value.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="size-3.5 flex-shrink-0" />
          <span>Add {remaining} more photo{remaining > 1 ? "s" : ""} to meet the minimum of {min}.</span>
        </div>
      )}

      {/* Uploading progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
              <Loader2 className={`size-4 ${u.error ? "text-red-500" : "text-[#A68A3F] animate-spin"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#0A1F44] truncate">{u.name}</div>
                {u.error ? (
                  <div className="text-xs text-red-600">{u.error}</div>
                ) : (
                  <div className="h-1.5 bg-border rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A961] to-[#A68A3F] transition-all"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{u.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Thumbnails grid */}
      {value.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold">
              {value.length} Photo{value.length !== 1 ? "s" : ""} Uploaded
            </h4>
            <span className="text-[10px] text-muted-foreground">Drag to reorder · Click ⭐ to set cover</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {value.map((url, i) => (
              <div
                key={url + i}
                draggable
                onDragStart={() => handleThumbDragStart(i)}
                onDragOver={(e) => handleThumbDragOver(e, i)}
                onDragEnd={handleThumbDragEnd}
                className={`
                  group relative aspect-square rounded-xl overflow-hidden border-2 bg-[#F9FAFB] cursor-move
                  ${i === 0 ? "border-[#C9A961] ring-2 ring-[#C9A961]/30" : "border-border"}
                  ${draggedIndex === i ? "opacity-50" : ""}
                `}
              >
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Cover badge */}
                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#C9A961] text-[#0A1F44] text-[9px] font-bold tracking-wide uppercase flex items-center gap-1">
                    <Star className="size-2.5 fill-current" /> Cover
                  </div>
                )}

                {/* Position number */}
                <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMakeCover(i); }}
                      title="Make cover"
                      className="size-8 rounded-full bg-[#C9A961] hover:bg-[#D4AF37] text-[#0A1F44] flex items-center justify-center"
                    >
                      <Star className="size-3.5 fill-current" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                    title="Delete"
                    className="size-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Drag handle indicator */}
                <div className="absolute bottom-1.5 left-1.5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="size-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {value.length === 0 && uploading.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          No photos yet. Upload at least {min} photos to proceed.
        </p>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, ImageIcon, Video, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MediaUploadFieldProps {
  /** Current file URL */
  value: string;
  /** Called when a file is uploaded (URL is passed back automatically) */
  onChange: (url: string) => void;
  /** What type of media to accept */
  type?: "image" | "video";
  /** Upload folder (e.g. "agents", "communities", "blog") */
  folder?: string;
  /** Label shown above the field */
  label?: string;
  /** Whether to show the URL text input below the upload button (default: false) */
  showUrlInput?: boolean;
  /** Preview dimensions */
  previewSize?: "sm" | "md" | "lg";
  /**
   * Upload API endpoint. Defaults to "/api/admin/upload" (admin portal).
   * Agent portal should pass "/api/agent/upload".
   */
  endpoint?: string;
}

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export function MediaUploadField({
  value,
  onChange,
  type = "image",
  folder = "general",
  label,
  showUrlInput = false,
  previewSize = "md",
  endpoint = "/api/admin/upload",
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(showUrlInput);
  const fileRef = useRef<HTMLInputElement>(null);

  const accept = type === "video" ? VIDEO_TYPES.join(",") : IMAGE_TYPES.join(",");
  const maxSize = type === "video" ? 100 * 1024 * 1024 : 8 * 1024 * 1024; // 100MB video, 8MB image

  const sizes = {
    sm: "size-12",
    md: "size-16",
    lg: "size-20",
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = type === "video" ? VIDEO_TYPES : IMAGE_TYPES;
    if (!allowed.includes(file.type)) {
      toast.error(`Unsupported file type. Allowed: ${type === "video" ? "MP4, WebM" : "JPG, PNG, WEBP, GIF"}`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${type === "video" ? "100MB" : "8MB"}.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", folder);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      const url = data.files[0].url;
      onChange(url);
      toast.success(`${type === "video" ? "Video" : "Image"} uploaded successfully`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      {label && (
        <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-1.5 block">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        {/* Preview */}
        {value && (
          <div className={`${sizes[previewSize]} rounded-lg overflow-hidden border border-border bg-[#F9FAFB] flex-shrink-0 relative`}>
            {type === "video" ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="preview" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {/* Upload button */}
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-full flex-shrink-0"
          size="sm"
        >
          {uploading ? (
            <Loader2 className="size-4 mr-1.5 animate-spin" />
          ) : type === "video" ? (
            <Video className="size-4 mr-1.5" />
          ) : (
            <Upload className="size-4 mr-1.5" />
          )}
          {uploading ? "Uploading..." : `Upload ${type === "video" ? "Video" : "Image"}`}
        </Button>

        {/* Remove button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange("")}
            className="text-red-600 hover:bg-red-50 rounded-full flex-shrink-0"
            size="sm"
          >
            <X className="size-4" />
          </Button>
        )}

        {/* Toggle URL input */}
        <button
          type="button"
          onClick={() => setShowUrl(!showUrl)}
          className="text-xs text-muted-foreground hover:text-[#A68A3F] flex items-center gap-1 ml-auto flex-shrink-0"
          title="Advanced: paste URL manually"
        >
          <Link2 className="size-3" />
          {showUrl ? "Hide URL" : "URL"}
        </button>
      </div>

      {/* Optional URL text input (collapsed by default) */}
      {showUrl && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#F9FAFB] mt-2 text-xs font-mono"
          placeholder={`Paste ${type} URL (advanced)`}
        />
      )}

      {/* Helper text */}
      {!value && !uploading && (
        <p className="text-xs text-muted-foreground mt-1.5">
          Click "Upload {type === "video" ? "Video" : "Image"}" to select a file from your device.
          {type === "video" ? " Max 100MB (MP4/WebM)." : " Max 8MB (JPG/PNG/WEBP)."}
        </p>
      )}
    </div>
  );
}

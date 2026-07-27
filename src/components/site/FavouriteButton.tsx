"use client";

import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";

interface Props {
  propertyId: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Favourite / Save button — toggles the property's saved state in the
 * user's local (persisted) zustand store.
 *
 * Used on the Property Detail Page action bar.
 */
export function FavouriteButton({ propertyId, className = "", size = "md" }: Props) {
  const toggleSaved = useStore((s) => s.toggleSavedProperty);
  const isSaved = useStore((s) => s.isSaved(propertyId));
  const saved = isSaved;

  const sizeClass = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm";

  return (
    <button
      onClick={() => toggleSaved(propertyId)}
      className={`inline-flex items-center justify-center gap-1.5 ${sizeClass} rounded-lg border transition-all ${
        saved
          ? "bg-[#C9A961] border-[#C9A961] text-[#0A1F44] hover:bg-[#D4B875]"
          : "bg-white border-[#0A1F44]/20 text-[#0A1F44] hover:border-[#C9A961] hover:bg-[#C9A961]/5"
      } font-semibold ${className}`}
      aria-label={saved ? "Remove from saved" : "Save property"}
      aria-pressed={saved}
    >
      <Heart
        className={size === "sm" ? "size-3.5" : "size-4"}
      />
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

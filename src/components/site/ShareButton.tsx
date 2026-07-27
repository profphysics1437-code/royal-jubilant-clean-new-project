"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Copy, Check, Twitter, Facebook, Mail, MessageCircle, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** Title of the property/page — used in share text. */
  title: string;
  /** Optional subtitle / description for share text. */
  description?: string;
  /** Additional className for the trigger button. */
  className?: string;
  /** Button size variant. */
  size?: "sm" | "md";
}

/**
 * Premium share button for Royal Jubilant.
 *
 * Behaviour:
 *   1. On supported devices (mobile / some desktop browsers), calls the
 *      native Web Share API — gives the user the OS share sheet.
 *   2. Fallback (desktop without Web Share, or API fails): shows a premium
 *      dropdown with copy-link + Twitter / Facebook / WhatsApp / Email
 *      options.
 *
 * The shared URL is always the current browser URL (window.location.href),
 * which is the canonical property detail URL.
 */
export function ShareButton({ title, description, className = "", size = "md" }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "https://www.royaljubilant.com";
  const shareText = `${title}${description ? ` — ${description.slice(0, 100)}` : ""}`;
  const fullShareText = `${shareText}\n\n${shareUrl}`;

  const handleShare = async () => {
    // Try Web Share API first
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
        return; // success — don't open dropdown
      } catch (err: any) {
        // User cancelled or API failed — fall through to dropdown
        if (err?.name === "AbortError") return; // user cancelled, don't open dropdown
      }
    }
    // Fallback: open our dropdown
    setDropdownOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers — use a hidden input
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Couldn't copy link");
      }
      document.body.removeChild(input);
    }
    setDropdownOpen(false);
  };

  const sizeClass = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm";

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: <MessageCircle className="size-4 text-[#25D366]" />,
      href: `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
      external: true,
    },
    {
      label: "Twitter / X",
      icon: <Twitter className="size-4 text-[#1DA1F2]" />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      external: true,
    },
    {
      label: "Facebook",
      icon: <Facebook className="size-4 text-[#1877F2]" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      external: true,
    },
    {
      label: "Email",
      icon: <Mail className="size-4 text-[#6B7280]" />,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullShareText)}`,
      external: false,
    },
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-1.5 ${sizeClass} rounded-lg bg-white border border-[#0A1F44]/20 hover:border-[#C9A961] hover:bg-[#C9A961]/5 text-[#0A1F44] font-semibold transition-all ${className}`}
        aria-label="Share this property"
        aria-expanded={dropdownOpen}
      >
        <Share2 className={size === "sm" ? "size-3.5" : "size-4"} />
        <span>Share</span>
      </button>

      {/* Dropdown — fallback when Web Share API not available */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] p-2 z-50"
          role="menu"
        >
          <div className="px-2 py-1.5 mb-1 border-b border-[#F4F5F7]">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
              Share this property
            </p>
          </div>

          {/* Copy link row */}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
          >
            {copied ? (
              <Check className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4 text-[#0A1F44]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#0A1F44]">
                {copied ? "Copied!" : "Copy link"}
              </p>
              <p className="text-[10px] text-[#9CA3AF] truncate font-mono">
                {shareUrl}
              </p>
            </div>
          </button>

          {/* Share options */}
          {shareOptions.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target={opt.external ? "_blank" : undefined}
              rel={opt.external ? "noreferrer" : undefined}
              onClick={() => setDropdownOpen(false)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left"
            >
              {opt.icon}
              <span className="text-sm font-medium text-[#0A1F44]">
                {opt.label}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { MessageCircle, Phone, Calculator, Heart, X, Calendar } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingActions() {
  const [open, setOpen] = useState(false);
  const { setMortgageOpen, setValuationOpen, savedProperties } = useStore();
  const { get } = useSiteSettings();
  const phone = get("company.phone", "+971 4 327 8401");
  const whatsapp = get("company.whatsapp", "971524942329");

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setValuationOpen(true);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg border border-border text-sm font-medium text-[#0A1F44] hover:bg-[#F9FAFB]"
            >
              <Calendar className="size-4 text-[#A68A3F]" />
              Book Valuation
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                setMortgageOpen(true);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg border border-border text-sm font-medium text-[#0A1F44] hover:bg-[#F9FAFB]"
            >
              <Calculator className="size-4 text-[#A68A3F]" />
              Mortgage
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              onClick={() => window.open(`tel:${phone}`, "_self")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-lg border border-border text-sm font-medium text-[#0A1F44] hover:bg-[#F9FAFB]"
            >
              <Phone className="size-4 text-[#A68A3F]" />
              Call Office
            </motion.button>

            <motion.a
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.15 }}
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] shadow-lg text-sm font-medium text-white hover:bg-[#1faa50]"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </motion.a>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        aria-label="Quick actions"
        className={`size-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
          open ? "bg-[#0A1F44] text-white rotate-45" : "bg-[#C9A961] hover:bg-[#A68A3F] text-[#0A1F44]"
        }`}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}

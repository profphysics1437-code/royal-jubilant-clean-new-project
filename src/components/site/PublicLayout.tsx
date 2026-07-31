"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { PopupManager } from "@/components/site/PopupManager";
import { PropertyDetailModal } from "@/components/site/modals/PropertyDetailModal";
import { AgentModal } from "@/components/site/modals/AgentModal";
import { CommunityModal } from "@/components/site/modals/CommunityModal";
import { DeveloperModal } from "@/components/site/modals/DeveloperModal";
import { MortgageModal } from "@/components/site/modals/MortgageModal";
import { ValuationModal } from "@/components/site/modals/ValuationModal";
import { DashboardModal } from "@/components/site/modals/DashboardModal";
import AIChatWidget from "@/components/ai/AIChatWidget";

/**
 * PublicLayout — shared wrapper for all public-facing pages.
 *
 * Includes: Navbar, Footer, FloatingActions, PopupManager, all modals,
 * AI chat widget, and lead form. This ensures every public page has
 * the same navigation, contact options, and interactive features.
 *
 * Used by:
 *   - / (homepage)
 *   - /rent
 *   - /sale
 *   - /rent/[category]
 *   - /sale/[category]
 *   - (future public clean-URL pages)
 *
 * NOT used by:
 *   - /admin/* (has its own layout)
 *   - /agent/* (has its own layout)
 *   - /properties/[slug] (has its own header)
 *   - /market-insights/[slug] (has its own header)
 */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 min-w-0">{children}</main>

      <Footer />

      {/* Floating actions */}
      <FloatingActions />

      {/* Popup Manager — CMS-controlled popups */}
      <PopupManager />

      {/* Modals */}
      <PropertyDetailModal />
      <AgentModal />
      <CommunityModal />
      <DeveloperModal />
      <MortgageModal />
      <ValuationModal />
      <DashboardModal />

      {/* RJ AI Concierge Widget */}
      <AIChatWidget />
    </div>
  );
}

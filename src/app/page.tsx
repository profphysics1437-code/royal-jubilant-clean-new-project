"use client";

export const dynamic = "force-dynamic";

// Force dynamic rendering on Vercel


import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { ExploreProperty } from "@/components/site/sections/ExploreProperty";
import { FloatingActions } from "@/components/site/FloatingActions";
import { PopupManager } from "@/components/site/PopupManager";
import {
  LatestProperties,
} from "@/components/site/sections/FeaturedProperties";
import { Agents } from "@/components/site/sections/Agents";
import { Testimonials } from "@/components/site/sections/Stats";
import { VideoSection } from "@/components/site/sections/Blog";
import { Newsletter } from "@/components/site/sections/OffPlan";

// Modals
import { PropertyDetailModal } from "@/components/site/modals/PropertyDetailModal";
import { AgentModal } from "@/components/site/modals/AgentModal";
import { CommunityModal } from "@/components/site/modals/CommunityModal";
import { DeveloperModal } from "@/components/site/modals/DeveloperModal";
import { MortgageModal } from "@/components/site/modals/MortgageModal";
import { ValuationModal } from "@/components/site/modals/ValuationModal";
import { DashboardModal } from "@/components/site/modals/DashboardModal";

// Views
import { PropertyListView } from "@/components/site/views/PropertyListView";
import {
  CommunitiesView,
  AgentsView,
  DevelopersView,
  BlogView,
  AboutView,
  ContactView,
  FAQsView,
  CareersView,
  SavedView,
  AdviceView,
  AboutOffPlanView,
} from "@/components/site/views/MiscViews";
import { RentalYieldCalculator, BuyVsRentCalculator } from "@/components/site/views/CalculatorViews";
import { StoryView } from "@/components/site/views/StoryView";
import { AIPoweredView } from "@/components/site/views/AIPoweredView";
import AIChatWidget from "@/components/ai/AIChatWidget";

export default function Home() {
  const { activeView, setActiveView } = useStore();

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const hash = window.location.hash.replace("#/", "");
      const view = hash || "home";
      // Only update state, don't push history again
      useStore.setState({ activeView: view });
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("popstate", handlePopState);

    // On initial load, check if there's a hash and set the view
    const initialHash = window.location.hash.replace("#/", "");
    if (initialHash) {
      useStore.setState({ activeView: initialHash });
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 min-w-0">
        {activeView === "home" && (
          <>
            <Hero />
            <ExploreProperty />
            <LatestProperties />
            <VideoSection />
            <Agents />
            <Testimonials />
            <Newsletter />
          </>
        )}

        {activeView === "buy" && <PropertyListView filter="sale" />}
        {activeView === "rent" && <PropertyListView filter="rent" />}
        {activeView === "rent-rooms" && <PropertyListView filter="rent-rooms" />}
        {activeView === "rent-holiday" && <PropertyListView filter="rent-holiday" />}
        {activeView === "rent-monthly" && <PropertyListView filter="rent-monthly" />}
        {activeView === "rent-daily" && <PropertyListView filter="rent-daily" />}
        {activeView === "commercial" && <PropertyListView filter="commercial" />}
        {activeView === "commercial-rent" && <PropertyListView filter="commercial-rent" />}
        {activeView === "commercial-sale" && <PropertyListView filter="commercial-sale" />}
        {activeView === "off-plan" && <PropertyListView filter="off-plan" />}
        {activeView === "about-offplan" && <AboutOffPlanView />}
        {activeView === "luxury" && <PropertyListView filter="luxury" />}
        {activeView === "search-results" && <PropertyListView filter="all" />}
        {activeView === "communities" && <CommunitiesView />}
        {activeView === "agents" && <AgentsView />}
        {activeView === "developers" && <DevelopersView />}
        {activeView === "blog" && <BlogView />}
        {activeView === "about" && <AboutView />}
        {activeView === "contact" && <ContactView />}
        {activeView === "faqs" && <FAQsView />}
        {activeView === "calc-yield" && <RentalYieldCalculator />}
        {activeView === "calc-buyrent" && <BuyVsRentCalculator />}
        {activeView === "careers" && <CareersView />}
        {activeView === "saved" && <SavedView />}
        {activeView === "advice" && <AdviceView />}
        {activeView === "story" && <StoryView />}
        {activeView === "ai-powered" && <AIPoweredView />}
      </main>

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

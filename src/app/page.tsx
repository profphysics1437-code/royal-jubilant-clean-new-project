"use client";

export const dynamic = "force-dynamic";

// Force dynamic rendering on Vercel


import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Hero } from "@/components/site/Hero";
import { ExploreProperty } from "@/components/site/sections/ExploreProperty";
import {
  LatestProperties,
} from "@/components/site/sections/FeaturedProperties";
import { Agents } from "@/components/site/sections/Agents";
import { Testimonials } from "@/components/site/sections/Stats";
import { VideoSection } from "@/components/site/sections/Blog";
import { Newsletter } from "@/components/site/sections/OffPlan";

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

// All public hash routes have been migrated to clean Next.js routes.
// When a legacy hash is detected, redirect to the clean URL.
const HASH_REDIRECTS: Record<string, string> = {
  rent: "/rent",
  buy: "/sale",
  sale: "/sale",
  "rent-rooms": "/rent-rooms",
  "rent-holiday": "/rent-holiday",
  "rent-monthly": "/rent-monthly",
  "rent-daily": "/rent-daily",
  commercial: "/commercial",
  "commercial-rent": "/commercial-rent",
  "commercial-sale": "/commercial-sale",
  "off-plan": "/off-plan",
  "about-offplan": "/about-offplan",
  luxury: "/luxury",
  "search-results": "/rent",
  communities: "/communities",
  agents: "/agents",
  developers: "/developers",
  blog: "/blog",
  about: "/about",
  contact: "/contact",
  faqs: "/faqs",
  "calc-yield": "/calc-yield",
  "calc-buyrent": "/calc-buyrent",
  careers: "/careers",
  saved: "/saved",
  advice: "/advice",
  story: "/story",
  "ai-powered": "/ai-powered",
};

export default function Home() {
  const { activeView, setActiveView } = useStore();
  const router = useRouter();

  // Handle browser back/forward buttons + hash redirect compatibility
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#/", "");

      // Redirect migrated hash routes to clean URLs
      if (hash && HASH_REDIRECTS[hash]) {
        router.replace(HASH_REDIRECTS[hash]);
        return;
      }

      // For non-migrated hashes, keep the existing Zustand view system
      const view = hash || "home";
      useStore.setState({ activeView: view });
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    // Handle popstate (browser back/forward)
    const handlePopState = () => handleHash();
    window.addEventListener("popstate", handlePopState);

    // On initial load, check hash
    handleHash();

    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  return (
    <PublicLayout>
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

      {/* Rent/Sale are now at /rent and /sale (clean URLs).
          These hash-based views are kept as fallback for backward compat
          but will redirect to clean URLs via the hash redirect above. */}
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
    </PublicLayout>
  );
}

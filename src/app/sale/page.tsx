import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Properties for Sale in Dubai | Royal Jubilant Real Estate",
  description:
    "Buy Dubai's finest properties — villas, apartments, penthouses and off-plan projects across Palm Jumeirah, Downtown, Dubai Hills, Business Bay and more. RERA-certified advisory from Royal Jubilant Real Estate.",
  alternates: {
    canonical: "/sale",
  },
  openGraph: {
    title: "Properties for Sale in Dubai | Royal Jubilant Real Estate",
    description:
      "Buy Dubai's finest properties across the city's most prestigious communities.",
    siteName: "Royal Jubilant Real Estate",
    type: "website",
    locale: "en_AE",
  },
};

export default function SalePage() {
  return (
    <PublicLayout>
      <PropertyListView filter="sale" />
    </PublicLayout>
  );
}

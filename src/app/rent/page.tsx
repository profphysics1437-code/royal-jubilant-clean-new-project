import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Properties for Rent in Dubai | Royal Jubilant Real Estate",
  description:
    "Browse Dubai's premier rental properties — apartments, villas, penthouses and townhouses across Palm Jumeirah, Downtown, Dubai Marina, Business Bay and more. RERA-certified advisory from Royal Jubilant Real Estate.",
  alternates: {
    canonical: "/rent",
  },
  openGraph: {
    title: "Properties for Rent in Dubai | Royal Jubilant Real Estate",
    description:
      "Browse Dubai's premier rental properties across the city's most prestigious communities.",
    siteName: "Royal Jubilant Real Estate",
    type: "website",
    locale: "en_AE",
  },
};

export default function RentPage() {
  return (
    <PublicLayout>
      <PropertyListView filter="rent" />
    </PublicLayout>
  );
}

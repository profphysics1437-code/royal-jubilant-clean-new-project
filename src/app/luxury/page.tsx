import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Luxury Collection | Royal Jubilant Real Estate",
  alternates: { canonical: "/luxury" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="luxury" />
    </PublicLayout>
  );
}

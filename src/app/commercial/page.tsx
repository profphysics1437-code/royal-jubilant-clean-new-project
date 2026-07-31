import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commercial Properties in Dubai | Royal Jubilant Real Estate",
  alternates: { canonical: "/commercial" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="commercial" />
    </PublicLayout>
  );
}

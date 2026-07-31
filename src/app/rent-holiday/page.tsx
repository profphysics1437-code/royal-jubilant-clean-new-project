import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Holiday Homes in Dubai | Royal Jubilant Real Estate",
  alternates: { canonical: "/rent-holiday" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="rent-holiday" />
    </PublicLayout>
  );
}

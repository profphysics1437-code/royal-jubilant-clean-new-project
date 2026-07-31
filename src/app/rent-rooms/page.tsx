import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rooms for Rent in Dubai | Royal Jubilant Real Estate",
  alternates: { canonical: "/rent-rooms" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="rent-rooms" />
    </PublicLayout>
  );
}

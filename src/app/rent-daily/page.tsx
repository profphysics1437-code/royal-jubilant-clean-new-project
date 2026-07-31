import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daily Short-Term Rentals in Dubai | Royal Jubilant",
  alternates: { canonical: "/rent-daily" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="rent-daily" />
    </PublicLayout>
  );
}

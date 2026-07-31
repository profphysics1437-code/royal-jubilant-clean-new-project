import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commercial Property for Rent in Dubai | Royal Jubilant",
  alternates: { canonical: "/commercial-rent" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="commercial-rent" />
    </PublicLayout>
  );
}

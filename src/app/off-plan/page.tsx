import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyListView } from "@/components/site/views/PropertyListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Off-Plan Projects in Dubai | Royal Jubilant Real Estate",
  alternates: { canonical: "/off-plan" },
};

export default function Page() {
  return (
    <PublicLayout>
      <PropertyListView filter="off-plan" />
    </PublicLayout>
  );
}

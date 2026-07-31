import { PublicLayout } from "@/components/site/PublicLayout";
import { DevelopersView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dubai Property Developers | Royal Jubilant Real Estate",
  alternates: { canonical: "/developers" },
};

export default function Page() {
  return (
    <PublicLayout>
      <DevelopersView />
    </PublicLayout>
  );
}

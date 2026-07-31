import { PublicLayout } from "@/components/site/PublicLayout";
import { CommunitiesView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dubai Communities Guide | Royal Jubilant Real Estate",
  alternates: { canonical: "/communities" },
};

export default function Page() {
  return (
    <PublicLayout>
      <CommunitiesView />
    </PublicLayout>
  );
}

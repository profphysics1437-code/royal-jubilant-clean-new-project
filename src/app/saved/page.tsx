import { PublicLayout } from "@/components/site/PublicLayout";
import { SavedView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved Properties | Royal Jubilant Real Estate",
  alternates: { canonical: "/saved" },
};

export default function Page() {
  return (
    <PublicLayout>
      <SavedView />
    </PublicLayout>
  );
}

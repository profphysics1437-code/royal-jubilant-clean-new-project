import { PublicLayout } from "@/components/site/PublicLayout";
import { AboutView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Royal Jubilant Real Estate | Dubai Luxury Property Advisors",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <PublicLayout>
      <AboutView />
    </PublicLayout>
  );
}

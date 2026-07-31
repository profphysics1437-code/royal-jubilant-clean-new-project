import { PublicLayout } from "@/components/site/PublicLayout";
import { CareersView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Careers at Royal Jubilant Real Estate | Dubai",
  alternates: { canonical: "/careers" },
};

export default function Page() {
  return (
    <PublicLayout>
      <CareersView />
    </PublicLayout>
  );
}

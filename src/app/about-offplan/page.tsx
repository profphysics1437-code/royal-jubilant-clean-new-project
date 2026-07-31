import { PublicLayout } from "@/components/site/PublicLayout";
import { AboutOffPlanView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Off-Plan Investment Guide | Royal Jubilant Real Estate",
  alternates: { canonical: "/about-offplan" },
};

export default function Page() {
  return (
    <PublicLayout>
      <AboutOffPlanView />
    </PublicLayout>
  );
}

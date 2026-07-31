import { PublicLayout } from "@/components/site/PublicLayout";
import { AdviceView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Advice — Video Insights | Royal Jubilant Real Estate",
  alternates: { canonical: "/advice" },
};

export default function Page() {
  return (
    <PublicLayout>
      <AdviceView />
    </PublicLayout>
  );
}

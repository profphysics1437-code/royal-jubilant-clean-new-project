import { PublicLayout } from "@/components/site/PublicLayout";
import { AgentsView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meet Our Advisors | Royal Jubilant Real Estate",
  alternates: { canonical: "/agents" },
};

export default function Page() {
  return (
    <PublicLayout>
      <AgentsView />
    </PublicLayout>
  );
}

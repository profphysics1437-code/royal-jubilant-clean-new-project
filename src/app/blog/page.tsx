import { PublicLayout } from "@/components/site/PublicLayout";
import { BlogView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Market Insights | Royal Jubilant Real Estate",
  alternates: { canonical: "/blog" },
};

export default function Page() {
  return (
    <PublicLayout>
      <BlogView />
    </PublicLayout>
  );
}

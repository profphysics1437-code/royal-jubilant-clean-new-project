import { PublicLayout } from "@/components/site/PublicLayout";
import { StoryView } from "@/components/site/views/StoryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Story | Royal Jubilant Real Estate",
  alternates: { canonical: "/story" },
};

export default function Page() {
  return (
    <PublicLayout>
      <StoryView />
    </PublicLayout>
  );
}

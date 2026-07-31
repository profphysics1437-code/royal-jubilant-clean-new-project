import { PublicLayout } from "@/components/site/PublicLayout";
import { AIPoweredView } from "@/components/site/views/AIPoweredView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI-Powered Real Estate | Royal Jubilant Real Estate",
  alternates: { canonical: "/ai-powered" },
};

export default function Page() {
  return (
    <PublicLayout>
      <AIPoweredView />
    </PublicLayout>
  );
}

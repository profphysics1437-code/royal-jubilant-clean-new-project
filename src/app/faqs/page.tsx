import { PublicLayout } from "@/components/site/PublicLayout";
import { FAQsView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Frequently Asked Questions | Royal Jubilant Real Estate",
  alternates: { canonical: "/faqs" },
};

export default function Page() {
  return (
    <PublicLayout>
      <FAQsView />
    </PublicLayout>
  );
}

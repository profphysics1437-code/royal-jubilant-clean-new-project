import { PublicLayout } from "@/components/site/PublicLayout";
import { ContactView } from "@/components/site/views/MiscViews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Royal Jubilant Real Estate | Dubai Property Advisors",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <PublicLayout>
      <ContactView />
    </PublicLayout>
  );
}

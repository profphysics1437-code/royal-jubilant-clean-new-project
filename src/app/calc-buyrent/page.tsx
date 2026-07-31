import { PublicLayout } from "@/components/site/PublicLayout";
import { BuyVsRentCalculator } from "@/components/site/views/CalculatorViews";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Buy vs Rent Calculator | Royal Jubilant Real Estate",
  alternates: { canonical: "/calc-buyrent" },
};

export default function Page() {
  return (
    <PublicLayout>
      <BuyVsRentCalculator />
    </PublicLayout>
  );
}

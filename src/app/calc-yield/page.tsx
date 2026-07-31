import { PublicLayout } from "@/components/site/PublicLayout";
import { RentalYieldCalculator } from "@/components/site/views/CalculatorViews";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Rental Yield Calculator | Royal Jubilant Real Estate",
  alternates: { canonical: "/calc-yield" },
};

export default function Page() {
  return (
    <PublicLayout>
      <RentalYieldCalculator />
    </PublicLayout>
  );
}

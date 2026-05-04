import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Differentiators } from "@/components/Differentiators";
import { TokenVsRules } from "@/components/TokenVsRules";
import { ForecastChart } from "@/components/ForecastChart";
import { StackComparison } from "@/components/StackComparison";
import { PlantSurvey } from "@/components/PlantSurvey";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Differentiators />
        <TokenVsRules />
        <ForecastChart />
        <StackComparison />
        <PlantSurvey />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

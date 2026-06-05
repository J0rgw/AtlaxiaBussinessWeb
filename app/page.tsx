import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Differentiators } from "@/components/Differentiators";
import { TokenVsRules } from "@/components/TokenVsRules";
import { PlantContext } from "@/components/PlantContext";
import { Deployment } from "@/components/Deployment";
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
        <PlantContext />
        <Deployment />
        <PlantSurvey />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

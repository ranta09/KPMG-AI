import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import NeuralNetworkCanvas from "@/components/NeuralNetworkCanvas";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] relative">
      {/* Interactive Global Network Background */}
      <NeuralNetworkCanvas />

      <HeroSection />
      <FeaturesSection />
      <TrustedBrandsSection />
      <FooterSection />
    </div>
  );
}

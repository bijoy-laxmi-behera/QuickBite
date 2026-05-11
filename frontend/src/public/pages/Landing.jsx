import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Steps from "../../components/Steps";
import MealPlans from "../../components/MealPlans";
import Featured from "../../components/Featured";
import CTASection from "../../components/CTASection";
import Footer from "../../components/Footer";

export default function Landing() {
  return (
    <div className="bg-[#f6f2ef] text-[#181210]">
      <Navbar />
      <Hero />
      <Steps />
      <MealPlans />
      <Featured />
      <CTASection />
      <Footer />
    </div>
  );
}
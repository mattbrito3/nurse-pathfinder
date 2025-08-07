import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { useScrollProgress } from "@/hooks/useScrollAnimations";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Index = () => {
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0,
      anchorPlacement: 'top-bottom'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <FAQ />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

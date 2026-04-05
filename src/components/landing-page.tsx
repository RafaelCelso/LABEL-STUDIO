"use client";

import { sharedStyles } from "@/components/landing/shared";
import { LandingBackground } from "@/components/landing/landing-background";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { Footer } from "@/components/landing/footer";

export function LandingPage() {
  return (
    <div className="dark min-h-screen w-full max-w-[100vw] overflow-x-hidden text-foreground">
      <style>{sharedStyles}</style>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <LandingBackground />
      <Navbar />
      <main className="relative z-10 overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}

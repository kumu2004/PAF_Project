import {
  LandingNavbar,
  HeroSection,
  StatsBar,
  FeaturesSection,
  HowItWorks,
  FacultiesSection,
  AboutSection,
  FaqSection,
  ContactSection,
  LandingFooter,
} from './components';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function LandingPage() {
  const { scrollY } = useScroll();
  // Move the background slightly to create a smooth parallax effect
  const y = useTransform(scrollY, [0, 1500], [0, 250]);

  return (
    <div className="relative min-h-screen">
      {/* Fixed Parallax Background */}
      <motion.div
        className="fixed inset-0 z-[-1] bg-cover bg-center"
        style={{
          backgroundImage: "url('/faculties/malabe.jpg')",
          scale: 1.1, // Slight scale up to prevent edges showing during parallax
          y
        }}
      >
        <div className="absolute inset-0 bg-[#1e40af]/80" /> {/* Refined Blue overlay */}
      </motion.div>

      <div className="relative z-0">
        <LandingNavbar />
        <main>
          <HeroSection />
          <StatsBar />
          <FeaturesSection />
          <HowItWorks />
          <FacultiesSection />
          <AboutSection />
          <FaqSection />
          <ContactSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}

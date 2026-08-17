"use client";

import { useState } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingBentoSection } from "@/components/landing/LandingBentoSection";
import { LandingGlobalMapSection } from "@/components/landing/LandingGlobalMapSection";
import { LandingDocsModal } from "@/components/landing/LandingDocsModal";

export default function Home() {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-rose-500 selection:text-white transition-colors">
      {/* 1. Header with Brand Logo & Navbar */}
      <LandingHeader onOpenDocsModal={() => setIsDocsOpen(true)} />

      {/* 2. Hero Section with Headline, Highlighter Effect, Action Buttons & Dependency Tree */}
      <main>
        <LandingHeroSection onOpenDocsModal={() => setIsDocsOpen(true)} />

        {/* 3. Bento Grid Section (Positioned Directly Below Hero Section) */}
        <LandingBentoSection />

        {/* 4. Global Attack Surface & Infrastructure Map */}
        <LandingGlobalMapSection />
      </main>

      {/* 5. Beautiful Developer Footer */}
      <LandingFooter />

      {/* 6. Interactive Docs Modal (Coming Soon) */}
      <LandingDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}

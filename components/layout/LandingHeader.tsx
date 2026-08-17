"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HydraLogo } from "../ui/HydraLogo";
import { ArrowRight, BookOpen, Terminal, Menu, X } from "lucide-react";

interface LandingHeaderProps {
  onOpenDocsModal?: () => void;
}

export function LandingHeader({ onOpenDocsModal }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <HydraLogo size={34} className="transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-mono text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              HYDRA<span className="text-rose-500 font-bold">SCOPE</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 tracking-wider">
              HACK HYDRA • TRACK 02
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8 text-xs sm:text-sm font-mono text-zinc-600 dark:text-zinc-400">
          <a href="#bento" className="hover:text-rose-500 transition-colors">
            Architecture
          </a>
          <a href="#map" className="hover:text-rose-500 transition-colors">
            Attack Surface
          </a>
          <a href="#tree" className="hover:text-rose-500 transition-colors">
            Dependency Tree
          </a>
        </nav>

        {/* CTA Buttons (Desktop + Mobile Toggle) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenDocsModal}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span>DOCS (COMING SOON)</span>
          </button>

          <Link
            href="/analyzer"
            aria-label="Launch Dashboard"
            title="Launch Dashboard"
            className="inline-flex items-center justify-center space-x-1.5 px-2.5 py-2 sm:px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-sm hover:shadow transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden sm:inline">LAUNCH DASHBOARD</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 animate-fadeIn">
          <a
            href="#bento"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-rose-500"
          >
            Architecture & Bento Grid
          </a>
          <a
            href="#map"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-rose-500"
          >
            Global Attack Surface
          </a>
          <a
            href="#tree"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-rose-500"
          >
            Dependency File Tree
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDocsModal?.();
            }}
            className="w-full text-left py-2 text-rose-500 font-bold"
          >
            📖 Docs (Coming Soon)
          </button>
        </div>
      )}
    </header>
  );
}

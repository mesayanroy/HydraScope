"use client";

import React, { ReactNode } from "react";

export interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ElementType;
  description: string;
  href?: string;
  cta?: string;
  badge?: string;
}

export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  className = "",
  background,
  Icon,
  description,
  badge,
  href,
  cta = "Explore analysis",
}: BentoCardProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ${className}`}
    >
      {/* Background Decorator */}
      <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
        {background}
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-rose-500">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {name}
            </h3>
          </div>
          {badge && (
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {badge}
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
          {description}
        </p>

        {cta && (
          <div className="pt-2 flex items-center text-xs font-mono font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>{cta}</span>
            <span className="ml-1">→</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { ReactNode } from "react";

interface HighlighterTextProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function HighlighterText({
  children,
  className = "",
  color = "bg-rose-500/15 border-b-2 border-rose-500 text-rose-600 dark:text-rose-400",
}: HighlighterTextProps) {
  return (
    <span className={`relative inline-block px-1.5 py-0.5 rounded-sm font-semibold ${color} ${className}`}>
      {children}
    </span>
  );
}

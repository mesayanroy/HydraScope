import React from "react";

interface HydraLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export function HydraLogo({
  className = "w-8 h-8",
  size,
  showText = false,
  textClassName = "text-xl font-black tracking-tight",
}: HydraLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
        aria-label="HydraScope Logo"
      >
        {/* Deep dark background container */}
        <rect width="100" height="100" rx="20" fill="#09090B" />
        
        {/* Outer subtle glow border */}
        <rect width="98" height="98" x="1" y="1" rx="19" stroke="#27272A" strokeWidth="2" fill="none" />

        {/* 
          Official Hydra Logo Geometry:
          Two vertical pillars connected by curved arcs to a central horizontal diamond node.
        */}
        {/* Left Vertical Pillar */}
        <path d="M 27 25 H 41 V 42 C 34 46 34 54 41 58 V 75 H 27 V 25 Z" fill="#F43F5E" />

        {/* Right Vertical Pillar */}
        <path d="M 73 25 H 59 V 42 C 66 46 66 54 59 58 V 75 H 73 V 25 Z" fill="#F43F5E" />

        {/* Central Diamond Graph Junction */}
        <polygon points="50,42 61,50 50,58 39,50" fill="#E11D48" />

        {/* Top/Bottom connecting arcs */}
        <path d="M 41 25 Q 50 35 59 25 V 30 Q 50 40 41 30 Z" fill="#F43F5E" />
        <path d="M 41 75 Q 50 65 59 75 V 70 Q 50 60 41 70 Z" fill="#F43F5E" />
      </svg>

      {showText && (
        <span className={`font-mono text-zinc-900 dark:text-zinc-100 ${textClassName}`}>
          HYDRA<span className="text-rose-500 font-bold">SCOPE</span>
        </span>
      )}
    </div>
  );
}

"use client";

import React, { useMemo } from "react";

interface Point {
  x: number;
  y: number;
  label?: string;
  isAlert?: boolean;
}

interface DottedMapProps {
  className?: string;
  dotsColor?: string;
  activeColor?: string;
}

export function DottedMap({
  className = "w-full h-full min-h-[320px]",
  dotsColor = "rgba(161, 161, 170, 0.25)",
  activeColor = "#F43F5E",
}: DottedMapProps) {
  // Key global infrastructure nodes (US East, US West, Europe Central, Asia East, South America)
  const nodePoints: Point[] = useMemo(
    () => [
      { x: 220, y: 140, label: "prod-us-east-1", isAlert: true },
      { x: 130, y: 150, label: "us-west-2", isAlert: false },
      { x: 440, y: 110, label: "eu-central-1 (Frankfurt)", isAlert: true },
      { x: 490, y: 130, label: "eu-west-1 (Ireland)", isAlert: false },
      { x: 700, y: 160, label: "ap-northeast-1 (Tokyo)", isAlert: true },
      { x: 670, y: 220, label: "ap-southeast-1 (Singapore)", isAlert: false },
      { x: 280, y: 280, label: "sa-east-1 (São Paulo)", isAlert: false },
      { x: 760, y: 310, label: "ap-southeast-2 (Sydney)", isAlert: false },
    ],
    [],
  );

  // Generate grid matrix dots
  const gridDots = useMemo(() => {
    const dots = [];
    const cols = 45;
    const rows = 22;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip some dots to form continent shapes roughly
        const x = (c / cols) * 880 + 30;
        const y = (r / rows) * 360 + 20;

        // Simple mask filtering for continents
        const isLand =
          (x > 100 && x < 320 && y > 60 && y < 220) || // North America
          (x > 220 && x < 340 && y > 220 && y < 340) || // South America
          (x > 400 && x < 540 && y > 50 && y < 180) || // Europe
          (x > 420 && x < 580 && y > 180 && y < 330) || // Africa
          (x > 540 && x < 820 && y > 60 && y < 250) || // Asia
          (x > 700 && x < 840 && y > 250 && y < 350); // Australia

        if (isLand && Math.random() > 0.15) {
          dots.push({ x, y });
        }
      }
    }
    return dots;
  }, []);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      <svg viewBox="0 0 920 400" className="w-full h-auto max-w-5xl opacity-90">
        {/* World Grid Dots */}
        {gridDots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r="2.2" fill={dotsColor} />
        ))}

        {/* Attack Propagation Vectors (Connecting Arcs) */}
        <path
          d="M 220 140 Q 330 70 440 110"
          stroke="#F43F5E"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M 440 110 Q 570 60 700 160"
          stroke="#F43F5E"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M 220 140 Q 460 220 700 160"
          stroke="rgba(244,63,94,0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
        />

        {/* Global Node Beacons */}
        {nodePoints.map((pt, i) => (
          <g key={i} className="group cursor-pointer">
            {pt.isAlert && (
              <circle cx={pt.x} cy={pt.y} r="12" fill={activeColor} opacity="0.25" className="animate-ping" />
            )}
            <circle cx={pt.x} cy={pt.y} r="5" fill={pt.isAlert ? activeColor : "#A1A1AA"} />
            <circle cx={pt.x} cy={pt.y} r="2.5" fill="#FFFFFF" />

            {pt.label && (
              <text
                x={pt.x + 8}
                y={pt.y + 4}
                fill={pt.isAlert ? "#F43F5E" : "#71717A"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight={pt.isAlert ? "bold" : "normal"}
              >
                {pt.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Floating Status Overlay */}
      <div className="absolute bottom-3 left-4 flex items-center space-x-2 text-xs font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full shadow-lg backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        <span>HYDRADB GRAPH METRICS: 17 REPOSITORIES • 8 SERVICES EXPOSED</span>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode, CSSProperties } from "react";
import { Thermometer, Gauge, Droplets, Wind } from "lucide-react";

interface ClimateInstrumentProps {
  label: string;
  financialMeasure: string;
  value: string | number;
  unit: string;
  percentage: number; // For visualization bar (0 - 100)
  theme: "amber" | "blue" | "emerald" | "slate" | "rose";
  icon: ReactNode;
  description: string;
  id?: string;
  extraInfo?: ReactNode;
}

export default function ClimateInstrument({
  label,
  financialMeasure,
  value,
  unit,
  percentage,
  theme,
  icon,
  description,
  id,
  extraInfo,
}: ClimateInstrumentProps) {
  const themes = {
    amber: {
      bar: "bg-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    blue: {
      bar: "bg-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
    emerald: {
      bar: "bg-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
    slate: {
      bar: "bg-slate-400",
      bg: "bg-slate-400/10",
      border: "border-slate-500/20",
      text: "text-slate-300",
    },
    rose: {
      bar: "bg-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-400",
    },
  };

  const selectedTheme = themes[theme] || themes.slate;

  // Real-time animation variables based on meteorological intensity percentage
  let customIconStyle: CSSProperties = {};
  let iconClass = "";

  if (id === "gauge_wind") {
    // Shorter duration = faster rotation for higher wind volumes
    const durSec = Math.max(0.5, 8 - (percentage / 100) * 7.2);
    customIconStyle = { animation: `spin ${durSec}s linear infinite` };
  } else if (id === "gauge_temperature") {
    // Pulse animation frequency scales with temperature heat index
    const durSec = Math.max(0.8, 3 - (percentage / 100) * 2);
    customIconStyle = { animation: `pulse ${durSec}s ease-in-out infinite` };
  } else if (id === "gauge_humidity") {
    // Float/bobbing animation scaling with fear levels (humidity)
    const durSec = Math.max(1, 4 - (percentage / 100) * 2.8);
    customIconStyle = { 
      animation: `bounce ${durSec}s ease-in-out infinite`,
      transformOrigin: "center"
    };
  } else if (id === "gauge_pressure") {
    // Heavy gauge indicator indicator shake if pressure drops/breaks
    const isCrisis = percentage < 25 || percentage > 85;
    if (isCrisis) {
      iconClass = "animate-bounce";
    }
  }

  return (
    <div 
      id={id} 
      className={`p-5 rounded-2xl border bg-slate-900/40 ${selectedTheme.border} transition-all duration-300 hover:bg-slate-900/80 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden group`}
    >
      {/* Decorative background grid flare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent pointer-events-none rounded-2xl"></div>

      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold flex items-center gap-1">
            <span className={`w-1 h-1 rounded-full ${selectedTheme.bar} inline-block group-hover:animate-ping`}></span>
            {label}
          </span>
          <h4 className="text-sm font-bold text-slate-200 leading-tight">
            {financialMeasure}
          </h4>
        </div>
        <div 
          className={`p-2 rounded-xl transition-all ${selectedTheme.bg} ${selectedTheme.text} ${iconClass}`}
          style={customIconStyle}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mt-3">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </span>
        <span className="text-xs text-slate-400 font-mono uppercase font-bold">
          {unit}
        </span>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-950 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full ${selectedTheme.bar} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.max(3, Math.min(100, percentage))}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-sans">
        {description}
      </p>

      {extraInfo && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-[10px] font-mono select-none flex flex-col gap-1">
          {extraInfo}
        </div>
      )}
    </div>
  );
}

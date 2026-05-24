/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from "react";
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

  return (
    <div id={id} className={`p-5 rounded-2xl border bg-slate-900/30 ${selectedTheme.border} transition-all hover:bg-slate-900/80`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">
            {label}
          </span>
          <h4 className="text-sm font-bold text-slate-200 leading-tight">
            {financialMeasure}
          </h4>
        </div>
        <div className={`p-2 rounded-xl ${selectedTheme.bg} ${selectedTheme.text}`}>
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

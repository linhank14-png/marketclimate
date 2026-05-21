/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, CloudSun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { WeatherCondition } from "../types";

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
  size?: number;
}

export default function WeatherIcon({ condition, className = "", size = 24 }: WeatherIconProps) {
  switch (condition) {
    case "clear_skies":
      return (
        <div className={`relative flex items-center justify-center p-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 ${className}`}>
          <Sun size={size} className="animate-spin-slow glow-amber" />
          <span className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-70"></span>
        </div>
      );
    case "partly_cloudy":
      return (
        <div className={`relative flex items-center justify-center p-2 rounded-full bg-blue-400/10 dark:bg-blue-400/20 text-blue-400 ${className}`}>
          <CloudSun size={size} className="animate-float glow-blue" />
        </div>
      );
    case "cloudy":
      return (
        <div className={`relative flex items-center justify-center p-2 rounded-full bg-slate-400/10 dark:bg-slate-400/20 text-slate-400 ${className}`}>
          <Cloud size={size} className="animate-pulse" />
        </div>
      );
    case "rainy":
      return (
        <div className={`relative flex items-center justify-center p-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-400 ${className}`}>
          <CloudRain size={size} className="animate-bounce" />
          {/* Falling drops stimulation representation */}
          <div className="absolute bottom-0 flex justify-between w-4 px-1">
            <span className="w-0.5 h-1 bg-indigo-400 rounded animate-bounce [animation-delay:0.1s]"></span>
            <span className="w-0.5 h-1 bg-indigo-400 rounded animate-bounce [animation-delay:0.3s]"></span>
            <span className="w-0.5 h-1 bg-indigo-400 rounded animate-bounce [animation-delay:0.5s]"></span>
          </div>
        </div>
      );
    case "thunderstorms":
      return (
        <div className={`relative flex items-center justify-center p-2 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 ${className}`}>
          <CloudLightning size={size} className="animate-float glow-red" />
          <svg
            className="absolute bottom-1 w-2 h-3.5 text-yellow-400 animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 11h-6V3L5 13h6v8l8-10z" />
          </svg>
        </div>
      );
    default:
      return <Cloud size={size} className={className} />;
  }
}

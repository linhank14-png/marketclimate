/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketWeather, WEATHER_METADATA, WeatherCondition } from "../types";
import { ArrowUpRight, ArrowDownRight, Cloud } from "lucide-react";

interface WeatherTickerProps {
  markets: MarketWeather[];
  onSelectCountry: (country: MarketWeather) => void;
  locale?: "en" | "zh" | "zht";
}

export default function WeatherTicker({ markets, onSelectCountry, locale = "en" }: WeatherTickerProps) {
  // Map country to nice unicode flags
  const getFlag = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const isZh = locale === "zh";
  const isZht = locale === "zht";
  const isAnyZh = isZh || isZht;

  const overridesZh: Record<WeatherCondition, string> = {
    clear_skies: "晴空万里",
    partly_cloudy: "晴间多云",
    cloudy: "阴天多云",
    rainy: "阴雨绵绵",
    thunderstorms: "雷暴降临"
  };

  const overridesZht: Record<WeatherCondition, string> = {
    clear_skies: "晴空萬里",
    partly_cloudy: "晴間多雲",
    cloudy: "陰天多雲",
    rainy: "陰雨綿綿",
    thunderstorms: "雷暴降臨"
  };

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 py-3 px-4 overflow-hidden">
      <div className="flex items-center gap-3">
        {/* Ticker status badge */}
        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          {isZht ? "即時衛星掃描" : isZh ? "实时卫星扫描" : "LIVE SAT SCAN"}
        </div>
        
        {/* Horizontal Marquee Track */}
        <div className="relative flex items-center w-full overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-6 whitespace-nowrap animate-none">
            {markets.map((market) => {
              const conditionLabel = isZht
                ? overridesZht[market.condition]
                : isZh
                ? overridesZh[market.condition]
                : WEATHER_METADATA[market.condition].label;
              const isPositive = market.indexChange >= 0;
              
              return (
                <button
                  key={market.code}
                  onClick={() => onSelectCountry(market)}
                  className="flex items-center gap-2.5 text-xs hover:bg-slate-800/50 py-1 px-2 rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  <span className="text-base" title={market.country}>
                    {getFlag(market.code)}
                  </span>
                  <span className="font-semibold text-slate-250 font-display">
                    {market.indexName}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {market.indexValue.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </span>
                  <div className={`flex items-center gap-0.5 font-mono text-[11px] font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isPositive ? "+" : ""}{market.indexChange}%
                  </div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">
                    ({conditionLabel})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

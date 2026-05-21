/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Search, Sparkles, Loader2, Compass } from "lucide-react";
import { MarketWeather } from "../types";

interface SatelliteSearchProps {
  onScanComplete: (market: MarketWeather) => void;
  isAiEnabled: boolean;
  locale: "en" | "zh";
}

const SCAN_LOGS = [
  "Positioning financial weather satellites...",
  "Calibrating interest rate dewpoints...",
  "Scanning regional GDP high-pressure zones...",
  "Mapping stock index volatility humidity matrices...",
  "Generating 7-day macroeconomic predictions...",
  "Fusing results into climate report JSON packages..."
];

const SCAN_LOGS_ZH = [
  "正在對準金融氣象衛星中繼...",
  "正在校準各國基準利率露點比例...",
  "正在探測地區GDP宏觀高壓空氣鋒...",
  "正在測繪指數走勢及暗池交易濕度矩陣...",
  "正在生成未來7天宏觀趨勢預警分析...",
  "正在拼裝深空遙測氣象分析JSON傳輸包..."
];

export default function SatelliteSearch({ onScanComplete, isAiEnabled, locale }: SatelliteSearchProps) {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isZh = locale === "zh";

  // Rotate messages during scan
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setLogIndex((prev) => (prev + 1) % SCAN_LOGS.length);
      }, 1200);
    } else {
      setLogIndex(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleScan = async (cName: string) => {
    if (!cName || cName.trim() === "") return;
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/markets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: cName, locale })
      });

      if (!response.ok) {
        throw new Error(isZh ? "當地衛星接收站報告數據鏈路高空偏折。" : "Local satellite stations reported a connectivity drop.");
      }

      const resData = await response.json();
      
      if (resData.data) {
        onScanComplete(resData.data);
        setQuery("");
      } else {
        throw new Error(resData.errorMsg || (isZh ? "無效的掃描遙測數據組。" : "Invalid scanning telemetry output."));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || (isZh ? "無法最終完成衛星氣候預測投射。" : "Failed to finalize satellite forecast."));
    } finally {
      setIsScanning(false);
    }
  };

  const suggestions = isZh 
    ? ["瑞士", "南韓", "新加坡", "台灣", "墨西哥"] 
    : ["Switzerland", "South Korea", "Singapore", "Taiwan", "Mexico"];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Absolute ambient atmospheric glow */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-3">
        <Compass className="text-blue-400 animate-float" size={18} />
        <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">
          {isZh ? "衛星探測氣象站" : "Satellite Search Station"}
        </h3>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        {isZh 
          ? "輸入世界上任何一個國家的英文/中文國名。我們的智能衛星AI將分析其交易所指數、估值溫度和主權基準利率，從而測算出該國金融大氣的氣候指引。" 
          : "Input any country in the world. Our satellite AI will analyze the exchange index volume, valuation temperature, and sovereign rates to forecast the market climate."}
      </p>

      {/* Input container */}
      <div className="flex flex-col sm:flex-row gap-2 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder={isZh ? "尋找特定國家經濟體 (例如: 南韓, 瑞士, 墨西哥)..." : "Type country (e.g. South Korea, Switzerland, Israel)..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isScanning}
            onKeyDown={(e) => e.key === "Enter" && handleScan(query)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 disabled:opacity-50 font-medium"
          />
        </div>
        
        <button
          onClick={() => handleScan(query)}
          disabled={isScanning || !query.trim()}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs font-mono uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
        >
          {isScanning ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Sparkles size={14} className="text-blue-200 animate-pulse" />
          )}
          {isScanning 
              ? (isZh ? "正在遙測..." : "Scanning...") 
              : (isZh ? "啟動氣象掃描" : "Launch Scan")}
        </button>
      </div>

      {/* Dynamic scan feedback */}
      {isScanning && (
        <div className="mt-4 p-3 bg-slate-950/60 border border-blue-950/40 rounded-xl flex items-center gap-3 animate-pulse">
          <Loader2 className="animate-spin text-blue-400 shrink-0" size={16} />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider block font-bold">
              {isZh ? "衛星數據鏈路已接通" : "Satellite Connection Engaged"}
            </span>
            <span className="text-xs text-slate-300 font-mono block truncate">
              {isZh ? SCAN_LOGS_ZH[logIndex] : SCAN_LOGS[logIndex]}
            </span>
          </div>
        </div>
      )}

      {/* Error feedback */}
      {errorMessage && (
        <p className="text-xs text-red-400 mt-2.5 font-mono bg-red-950/20 py-1.5 px-3 border border-red-900/30 rounded-lg">
          ⚠️ {errorMessage}
        </p>
      )}

      {/* Suggestion list */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-slate-500 uppercase font-mono mr-1">
          {isZh ? "快捷熱區雷達定位：" : "Meteorological Hotspots:"}
        </span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              if (!isScanning) {
                setQuery(s);
                handleScan(s);
              }
            }}
            disabled={isScanning}
            className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 px-2.5 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50 font-medium"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Banner reporting state */}
      <div className="mt-4 pt-3 border-t border-slate-850/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>{isZh ? "雷達控制天線" : "COCKPIT SATELLITE"}</span>
        <span className={isAiEnabled ? "text-emerald-400 flex items-center gap-1" : "text-amber-500 flex items-center gap-1"}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAiEnabled ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
          {isAiEnabled 
            ? (isZh ? "極地人工智慧衛星雷達運行中" : "POLAR ORBIT AI RADAR ACTIVE") 
            : (isZh ? "本地宏觀電腦模擬中" : "SIMULATION OUTLOOK FALLBACK")}
        </span>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { FiveDayTradingOutlook, WEATHER_METADATA } from "../types";

interface OutlookForecastChartProps {
  data: FiveDayTradingOutlook[];
  isZh?: boolean;
}

export default function OutlookForecastChart({ data, isZh = false }: OutlookForecastChartProps) {
  const [activeTab, setActiveTab] = useState<"temp_move" | "press_humidity">("temp_move");

  // Format the data for recharts visualization
  const tempKey = isZh ? "估值熱度 (°C)" : "Valuation Temp (°C)";
  const changeKey = isZh ? "每日波動 (%)" : "Daily Change (%)";
  const pressureKey = isZh ? "支撐氣壓 (hPa)" : "Support Pressure (hPa)";
  const humidityKey = isZh ? "情緒濕度 (VIX %)" : "Volatility Moisture (VIX %)";

  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayOfWeek = new Date().getDay();

  const chartData = data.map((item, idx) => {
    const getLocalizedDay = (day: string) => {
      const isToday = idx === 0 && item.day === weekdaysShort[currentDayOfWeek];
      if (isToday) {
        return isZh ? "今日" : "Today";
      }
      if (!isZh) return day;
      const map: Record<string, string> = {
        "Mon": "週一", "Tue": "週二", "Wed": "週三", "Thu": "週四", "Fri": "週五", "Sat": "週六", "Sun": "週日"
      };
      return map[day] || day;
    };

    // Synthesize pressure and humidity trends matching the day's climate indicators
    const derivedPressure = Math.round(1012 + (item.temp * 0.3) - (item.change * 1.5));
    const derivedHumidity = Math.round(Math.max(10, Math.min(95, 25 + (item.temp * 0.5) - (item.change * 2.2))));

    return {
      name: getLocalizedDay(item.day),
      [tempKey]: item.temp,
      [changeKey]: parseFloat(item.change.toFixed(2)),
      [pressureKey]: derivedPressure,
      [humidityKey]: derivedHumidity,
      condition: item.condition,
    };
  });

  // Custom Tooltip component for a weather report feel
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const conditionKey = payload[0]?.payload?.condition;
      const isClear = conditionKey === "clear_skies";
      const isPartly = conditionKey === "partly_cloudy";
      const isCloudy = conditionKey === "cloudy";
      const isRainy = conditionKey === "rainy";
      
      const locLabel = isZh 
        ? (isClear ? "晴空萬里" : isPartly ? "晴間多雲" : isCloudy ? "陰天多雲" : isRainy ? "陰雨綿綿" : "雷暴降臨")
        : WEATHER_METADATA[conditionKey]?.label || "N/A";

      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-1">
            {label} {isZh ? "預報" : "Forecast"}
          </p>
          <div className="space-y-1 mt-1">
            {activeTab === "temp_move" ? (
              <>
                <p className="text-amber-400">
                  🌡️ {isZh ? "估值溫感: " : "Market Temp: "}<span className="font-semibold">{payload[0].value}°C</span>
                </p>
                <p className={payload[1].value >= 0 ? "text-emerald-400" : "text-rose-450 text-red-400"}>
                  📈 {isZh ? "大盤股幅: " : "Index Move: "}<span className="font-semibold">{payload[1].value > 0 ? "+" : ""}{payload[1].value}%</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-violet-400">
                  🌀 {isZh ? "航道支撐氣壓: " : "Baro Support: "}<span className="font-semibold">{payload[0].value} hPa</span>
                </p>
                <p className="text-blue-400">
                  💧 {isZh ? "波動情緒濕度: " : "Fear Moisture: "}<span className="font-semibold">{payload[1].value}%</span>
                </p>
              </>
            )}
            <p className="text-indigo-400 uppercase text-[10px] mt-1.5 font-bold">
              🌤️ {isZh ? "所處氣候: " : "Condition: "}{locLabel}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-900/30 border border-slate-800 p-5 rounded-3xl relative flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white font-mono font-bold flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{isZh ? "交互式五日金融模擬氣候走勢" : "Interactive 5-Day Meteorological Outlook"}</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isZh ? "點擊切換查看資產估值、股幅或基本面氣旋雷達圖" : "Toggle tabs below to switch temperature, momentum overlays or barometric gauges"}
          </p>
        </div>

        {/* Dynamic selector tabs */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveTab("temp_move")}
            className={`px-3 py-1.5 text-[10px] font-mono font-extrabold rounded-md transition-all cursor-pointer ${
              activeTab === "temp_move"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-550 text-slate-400 hover:text-white"
            }`}
          >
            {isZh ? "🌡️ 估值與波幅" : "Thermal & Move"}
          </button>
          <button
            onClick={() => setActiveTab("press_humidity")}
            className={`px-3 py-1.5 text-[10px] font-mono font-extrabold rounded-md transition-all cursor-pointer ${
              activeTab === "press_humidity"
                ? "bg-violet-600 text-white shadow"
                : "text-slate-550 text-slate-400 hover:text-white"
            }`}
          >
            {isZh ? "🌀 氣壓與濕度" : "Baro & Moisture"}
          </button>
        </div>
      </div>

      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 5, bottom: 0, left: -25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="monospace"
            />
            
            {activeTab === "temp_move" ? (
              <>
                {/* Left Y-axis: Market Valuation Temp */}
                <YAxis
                  yAxisId="left"
                  stroke="#3b82f6"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}°`}
                  fontFamily="monospace"
                />
                {/* Right Y-axis: Daily change percentage */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                  fontFamily="monospace"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={20}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "9px",
                    fontFamily: "monospace",
                    color: "#94a3b8",
                  }}
                />
                <ReferenceLine yAxisId="right" y={0} stroke="#475569" strokeDasharray="2 2" />
                
                {/* Temperature as active bars representing heatwaves */}
                <Bar
                  yAxisId="left"
                  dataKey={tempKey}
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  barSize={18}
                  radius={[4, 4, 0, 0]}
                />
                
                {/* Daily stock change as line plotting */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={changeKey}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: "#059669", strokeWidth: 1, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </>
            ) : (
              <>
                {/* Left Y-axis: Barometric pressure */}
                <YAxis
                  yAxisId="left"
                  stroke="#8b5cf6"
                  fontSize={10}
                  tickLine={false}
                  domain={[990, 1035]}
                  tickFormatter={(v) => `${v}`}
                  fontFamily="monospace"
                />
                {/* Right Y-axis: VIX / Humidity percentage */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#38bdf8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  fontFamily="monospace"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={20}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "9px",
                    fontFamily: "monospace",
                    color: "#94a3b8",
                  }}
                />
                
                {/* Barometric Pressure as bars */}
                <Bar
                  yAxisId="left"
                  dataKey={pressureKey}
                  fill="#8b5cf6"
                  fillOpacity={0.12}
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  barSize={18}
                  radius={[4, 4, 0, 0]}
                />
                
                {/* Humidity as sky line */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={humidityKey}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: "#0284c7", strokeWidth: 1, fill: "#38bdf8" }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
  selectedCountry?: any;
}

// Simple seed-based deterministic pseudo-random generator
const seedRandom = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
};

export default function OutlookForecastChart({ data, isZh = false, selectedCountry = null }: OutlookForecastChartProps) {
  const [activeTab, setActiveTab] = useState<"temp_move" | "press_humidity">("temp_move");
  const [viewMode, setViewMode] = useState<"forecast" | "historical">("forecast");
  const [alertThreshold, setAlertThreshold] = useState<number>(1.5);

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

  const crossedDays = chartData.filter(item => {
    const val = item[changeKey];
    const numVal = typeof val === "number" ? val : parseFloat(String(val || 0));
    return Math.abs(isNaN(numVal) ? 0 : numVal) >= alertThreshold;
  });
  const crossedDaysList = crossedDays.map(item => item.name).join(", ");

  // Custom label for ReferenceLine with high-fidelity indicators
  const CustomReferenceLabel = (props: any) => {
    const { viewBox, value } = props;
    if (!viewBox) return null;
    const fillCol = "#f43f5e";
    const bgCol = "#4c0519";
    const xPos = viewBox.x + viewBox.width - 110;
    const yPos = viewBox.y - 10;

    return (
      <g className="select-none pointer-events-none">
        <rect
          x={xPos}
          y={yPos}
          width={105}
          height={18}
          rx={5}
          fill={bgCol}
          stroke={fillCol}
          strokeWidth={1}
          fillOpacity={0.95}
        />
        <text
          x={xPos + 52.5}
          y={yPos + 12}
          fill={fillCol}
          fontSize={8}
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          🚨 {isZh ? "預警" : "ALARM"} {value > 0 ? "+" : ""}{value.toFixed(1)}%
        </text>
      </g>
    );
  };

  // Generate deterministic 30D Historical Trend
  const historicalData = (() => {
    const count = 30;
    const countryCode = selectedCountry?.code || "US";
    const rand = seedRandom(countryCode);
    const targetPrice = selectedCountry?.indexValue || 1000;

    const changeFactors: number[] = [];
    for (let i = 0; i < count; i++) {
      let bias = 0.0006; // slight upward drift for stock markets
      if (selectedCountry?.condition === "thunderstorms") bias = -0.0035;
      else if (selectedCountry?.condition === "rainy") bias = -0.0015;
      else if (selectedCountry?.condition === "clear_skies") bias = 0.0025;
      else if (selectedCountry?.condition === "partly_cloudy") bias = 0.0012;

      const volatility = 0.016; 
      const dailyReturn = bias + (rand() - 0.53) * volatility;
      changeFactors.push(dailyReturn);
    }

    const dataPoints: any[] = [];
    let price = targetPrice;

    // Walk backward to build stable history ending at today's pricing
    for (let i = count - 1; i >= 0; i--) {
      const returnFactor = changeFactors[i];
      const prevPrice = price / (1 + returnFactor);

      const dateObj = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const formattedDate = dateObj.toLocaleDateString(isZh ? "zh-TW" : "en-US", { month: "short", day: "numeric" });

      let cond: any = "cloudy";
      if (returnFactor >= 0.009) cond = "clear_skies";
      else if (returnFactor >= 0.002) cond = "partly_cloudy";
      else if (returnFactor >= -0.002) cond = "cloudy";
      else if (returnFactor >= -0.008) cond = "rainy";
      else cond = "thunderstorms";

      const baseTemp = selectedCountry?.temperature || 21;
      const tempOffset = (returnFactor * 150) + (rand() - 0.5) * 5;
      const temp = Math.max(0, Math.min(45, Math.round(baseTemp + tempOffset)));

      dataPoints.push({
        name: formattedDate,
        price: Math.round(price * 100) / 100,
        temp: temp,
        change: Math.round(returnFactor * 10000) / 100,
        condition: cond,
      });

      price = prevPrice;
    }
    return dataPoints;
  })();

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

  // Historical custom tooltip
  const HistoricalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const conditionKey = payload[0]?.payload?.condition;
      const isClear = conditionKey === "clear_skies";
      const isPartly = conditionKey === "partly_cloudy";
      const isCloudy = conditionKey === "cloudy";
      const isRainy = conditionKey === "rainy";
      
      const locLabel = isZh 
        ? (isClear ? "晴空萬里" : isPartly ? "晴間多雲" : isCloudy ? "陰天多雲" : isRainy ? "陰雨綿綿" : "雷暴降臨")
        : WEATHER_METADATA[conditionKey]?.label || "N/A";

      const dailyChg = payload[0]?.payload?.change;

      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-1">
            📅 {label}
          </p>
          <div className="space-y-1 mt-1">
            <p className="text-amber-400">
              💵 {isZh ? "大盤指數: " : "Index Price: "}<span className="font-semibold">{payload[0]?.value?.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </p>
            <p className="text-sky-400">
              🌡️ {isZh ? "估值溫感: " : "Market Temp: "}<span className="font-semibold">{payload[1]?.value}°C</span>
            </p>
            <p className={dailyChg >= 0 ? "text-emerald-400" : "text-rose-450 text-red-400"}>
              📈 {isZh ? "單日幅率: " : "Daily Return: "}<span className="font-semibold">{dailyChg > 0 ? "+" : ""}{dailyChg}%</span>
            </p>
            <p className="text-indigo-400 uppercase text-[10px] mt-1.5 font-bold">
              🌤️ {isZh ? "當日氣象: " : "Climate: "}{locLabel}
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
            <span>
              {viewMode === "forecast" 
                ? (isZh ? "交互式五日金融模擬氣候走勢" : "Interactive 5-Day Meteorological Outlook")
                : (isZh ? "卅日歷史指數與微氣候關聯走勢" : "30-Day Historical Stock & Weather Trend")}
            </span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {viewMode === "forecast"
              ? (isZh ? "點擊切換查看資產估值、股幅或基本面氣旋雷達圖" : "Toggle tabs below to switch temperature, momentum overlays or barometric gauges")
              : (isZh ? "查看過去 30 日大盤收盤價與估值熱度的交互相關性" : "Inspect historical daily stock closing performance compared with climatic indicators")}
          </p>
        </div>

        <div className="flex gap-2 shrink-0 self-start sm:self-center">
          {/* Main View Mode Selector (Forecast vs 30D Trend) */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
            <button
              onClick={() => setViewMode("forecast")}
              className={`px-3 py-1 text-[10px] font-mono font-extrabold rounded-md transition-all cursor-pointer ${
                viewMode === "forecast"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isZh ? "🔮 五日預報" : "5D Forecast"}
            </button>
            <button
              onClick={() => setViewMode("historical")}
              className={`px-3 py-1 text-[10px] font-mono font-extrabold rounded-md transition-all cursor-pointer ${
                viewMode === "historical"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isZh ? "📊 歷史聯動" : "30D Historical"}
            </button>
          </div>

          {/* Sub-tabs for Forecast Mode */}
          {viewMode === "forecast" && (
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
              <button
                onClick={() => setActiveTab("temp_move")}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === "temp_move"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {isZh ? "🌡️ 估值與波幅" : "Thermal"}
              </button>
              <button
                onClick={() => setActiveTab("press_humidity")}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === "press_humidity"
                    ? "bg-violet-600 text-white shadow"
                    : "text-slate-550 text-slate-500 hover:text-white"
                }`}
              >
                {isZh ? "🌀 氣壓與濕度" : "Baro"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Threshold Control Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/45 border border-slate-800 p-3 rounded-2xl text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            ⚠️ {isZh ? "波動警報閥值" : "Alert Threshold"}:
          </span>
          <div className="flex items-center gap-2 grow sm:grow-0">
            <input
              type="range"
              min="0.5"
              max="4.5"
              step="0.1"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-rose-500 bg-slate-850 h-1.5 rounded-lg cursor-pointer transition-all focus:outline-none"
            />
            <span className="text-rose-400 font-extrabold text-sm w-12 text-right shrink-0">
              {alertThreshold.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {crossedDays.length > 0 ? (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] uppercase font-bold tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-ping"></span>
              {isZh 
                ? `雷達警報：將於 ⦗ ${crossedDaysList} ⦘ 突破臨界點！` 
                : `Spike forecasted on ⦗ ${crossedDaysList} ⦘`}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {isZh ? "安全空域：各板塊均在平穩波動內" : "Safe Airspace: predicted swings inside safety zone"}
            </span>
          )}
        </div>
      </div>

      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={viewMode === "historical" ? historicalData : chartData}
            margin={{ top: 10, right: 5, bottom: 0, left: -25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
              interval={viewMode === "historical" ? 5 : 0}
            />
            
            {viewMode === "historical" ? (
              <>
                {/* Left Y-axis: Stock Index Price (S&P, etc) */}
                <YAxis
                  yAxisId="left"
                  stroke="#3b82f6"
                  fontSize={10}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `${Math.round(v)}`}
                  fontFamily="monospace"
                />
                {/* Right Y-axis: Climatological Temperature */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#fbbf24"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}°`}
                  fontFamily="monospace"
                />
                <Tooltip content={<HistoricalTooltip />} />
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
                
                {/* Stock Performance closing line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  name={isZh ? "大盤指數收盤價" : "Stock Index Price"}
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                
                {/* Weather Temp correlation trend line */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  name={isZh ? "估值溫感 (°C)" : "Valuation Temp (°C)"}
                  dataKey="temp"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </>
            ) : activeTab === "temp_move" ? (
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
                <ReferenceLine 
                  yAxisId="right" 
                  y={alertThreshold} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.2}
                  label={<CustomReferenceLabel value={alertThreshold} />}
                />
                <ReferenceLine 
                  yAxisId="right" 
                  y={-alertThreshold} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.2}
                  label={<CustomReferenceLabel value={-alertThreshold} />}
                />
                
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
                  dot={(dotProps: any) => {
                    const { cx, cy, value } = dotProps;
                    if (value === undefined || value === null) return <circle key={`dot-empty-${Math.random()}`} />;
                    const isExceeded = Math.abs(value) >= alertThreshold;
                    if (isExceeded) {
                      return (
                        <g key={`dot-${dotProps.index}`}>
                          <circle cx={cx} cy={cy} r={7} fill="#f43f5e" className="animate-pulse" opacity={0.6} />
                          <circle cx={cx} cy={cy} r={4.5} fill="#f43f5e" stroke="#ffffff" strokeWidth={1} />
                        </g>
                      );
                    }
                    return (
                      <circle
                        key={`dot-sec-${dotProps.index}`}
                        cx={cx}
                        cy={cy}
                        r={3}
                        stroke="#059669"
                        strokeWidth={1}
                        fill="#10b981"
                      />
                    );
                  }}
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

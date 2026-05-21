/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { SevenDayOutlook, WEATHER_METADATA } from "../types";

interface OutlookForecastChartProps {
  data: SevenDayOutlook[];
  isZh?: boolean;
}

export default function OutlookForecastChart({ data, isZh = false }: OutlookForecastChartProps) {
  // Format the data for recharts visualization
  const tempKey = isZh ? "估值热度 (°C)" : "Valuation Temp (°C)";
  const changeKey = isZh ? "每日波动 (%)" : "Daily Change (%)";

  const chartData = data.map((item) => {
    const getLocalizedDay = (day: string) => {
      if (!isZh) return day;
      const map: Record<string, string> = {
        "Mon": "週一", "Tue": "週二", "Wed": "週三", "Thu": "週四", "Fri": "週五", "Sat": "週六", "Sun": "週日"
      };
      return map[day] || day;
    };

    return {
      name: getLocalizedDay(item.day),
      [tempKey]: item.temp,
      [changeKey]: parseFloat(item.change.toFixed(2)),
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
            <p className="text-amber-400">
              🌡️ {isZh ? "估值溫感: " : "Market Temp: "}<span className="font-semibold">{payload[0].value}°C</span>
            </p>
            <p className={payload[1].value >= 0 ? "text-emerald-400" : "text-rose-450 text-red-400"}>
              📈 {isZh ? "大盤股幅: " : "Index Move: "}<span className="font-semibold">{payload[1].value > 0 ? "+" : ""}{payload[1].value}%</span>
            </p>
            <p className="text-indigo-400 uppercase text-[10px] mt-1.5 font-bold">
              🌤️ {isZh ? "所處溫區: " : "Condition: "}{locLabel}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[290px] bg-slate-900/30 border border-slate-800 p-5 rounded-3xl relative">
      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center justify-between font-bold">
        <span>{isZh ? "七日金融模擬氣候走勢" : "7-Day Meteorological Outlook"}</span>
        <span className="text-[10px] text-blue-400">
          {isZh ? "估值温度与指数趋势动能图" : "Valuation Temp vs Price Pressure"}
        </span>
      </h4>

      <ResponsiveContainer width="100%" height={210}>
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
            height={30}
            iconSize={10}
            iconType="circle"
            wrapperStyle={{
              fontSize: "10px",
              fontFamily: "monospace",
              color: "#94a3b8",
              marginTop: "10px",
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
            strokeWidth={2.5}
            dot={{ r: 3.5, stroke: "#059669", strokeWidth: 1.5, fill: "#10b981" }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

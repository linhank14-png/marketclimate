/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeatherCondition = 'clear_skies' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorms';

export interface SevenDayOutlook {
  day: string;
  condition: WeatherCondition;
  temp: number;
  change: number; // Ticker % change predicted
}

export interface MarketWeather {
  country: string;
  code: string; // ISO 2-letter country code
  indexName: string; // e.g. S&P 500
  indexValue: number; // Current value
  indexChange: number; // % change today
  condition: WeatherCondition;
  temperature: number; // Valuation metric (P/E or temperature scale)
  pressure: number; // Market pressure (hPa)
  humidity: number; // Volatility, e.g., VIX (0-100%)
  windSpeed: number; // Volume relative scale (km/h)
  alert: string | null; // e.g., Bubble or Crash alert
  summary: string; // Thematic weather comparison
  economicAnalysis: string; // Brief analysis of economic and index conditions
  outlook7Day: SevenDayOutlook[];
}

export const WEATHER_METADATA: Record<WeatherCondition, {
  label: string;
  color: string;
  bgGradient: string;
  textColor: string;
  iconColor: string;
  description: string;
  marketStance: string;
}> = {
  clear_skies: {
    label: 'Clear Skies',
    color: 'emerald',
    bgGradient: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-950/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    iconColor: 'bg-amber-400 text-amber-950',
    description: 'Strongly Bullish. High buying interest, expansionary data, and robust earnings growth are driving index highs.',
    marketStance: 'Strongly Bullish (Buying Heatwave)',
  },
  partly_cloudy: {
    label: 'Partly Cloudy',
    color: 'blue',
    bgGradient: 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-950/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    iconColor: 'bg-blue-300 text-blue-900',
    description: 'Moderately Bullish. Stable economic indicators and index gains, though minor headwinds or consolidation exist.',
    marketStance: 'Moderately Bullish (Moderate Growth)',
  },
  cloudy: {
    label: 'Cloudy',
    color: 'gray',
    bgGradient: 'from-slate-50 to-zinc-100 dark:from-slate-900/20 dark:to-zinc-950/20',
    textColor: 'text-zinc-600 dark:text-zinc-400',
    iconColor: 'bg-zinc-400 text-zinc-900',
    description: 'Neutral / Sideways. Low momentum, flat trading, or mixed economic growth reports keeping markets within a narrow range.',
    marketStance: 'Neutral / Sideways (Sluggish Drizzle)',
  },
  rainy: {
    label: 'Rainy',
    color: 'orange',
    bgGradient: 'from-orange-50/50 to-red-100/30 dark:from-orange-950/10 dark:to-red-950/10',
    textColor: 'text-orange-700 dark:text-orange-400',
    iconColor: 'bg-zinc-500 text-zinc-100',
    description: 'Moderately Bearish. Sluggish earnings, inflationary concerns, or central bank tightening are triggering mild capital outflow.',
    marketStance: 'Moderately Bearish (Capital Outflow)',
  },
  thunderstorms: {
    label: 'Thunderstorms',
    color: 'red',
    bgGradient: 'from-red-50 to-rose-100 dark:from-red-950/25 dark:to-rose-950/10',
    textColor: 'text-rose-700 dark:text-rose-400',
    iconColor: 'bg-rose-600 text-rose-50 animate-pulse',
    description: 'Strongly Bearish. Panic selling, structural crisis, high volatility, and severe economic downturn signals are present.',
    marketStance: 'Strongly Bearish (Panic Sell-off)',
  },
};

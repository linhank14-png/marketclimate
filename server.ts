/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { MarketWeather } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared Gemini Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY" && API_KEY.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Successfully initialized GoogleGenAI client on the server.");
  } catch (error) {
    console.error("Error creating GoogleGenAI client:", error);
  }
} else {
  console.log("GEMINI_API_KEY is not defined. Active AI satellite forecasts will fall back to local computer simulations.");
}

// Predefined Initial Market Weather Database (Cache)
let marketCache: MarketWeather[] = [
  {
    country: "United States",
    code: "US",
    indexName: "S&P 500",
    indexValue: 5321.41,
    indexChange: 1.45,
    condition: "clear_skies",
    temperature: 29, // hot valuation (above standard P/E averages)
    pressure: 1024, // high pressure (strong bull confidence)
    humidity: 14, // low VIX volatility
    windSpeed: 38, // high trading volume today
    alert: "BULL HEATWAVE: Index hitting fresh record atmospheric levels. Low moisture suggests smooth continuation, but valuation is overheated.",
    summary: "Radiant high-pressure bull market with crystal-clear skies. Heavy capital inflows are whipping up warm breezes of investor optimism.",
    economicAnalysis: "Strong initial Q1 GDP estimates at 3.1% and a stabilizing jobs report demonstrating resilience. Although core inflation remains sticky at 2.8%, Fed hints at prospective easing have triggered broad buying across technology and financial sectors.",
    outlook7Day: [
      { day: "Mon", condition: "clear_skies", temp: 29, change: 1.2 },
      { day: "Tue", condition: "clear_skies", temp: 28, change: 0.8 },
      { day: "Wed", condition: "partly_cloudy", temp: 25, change: 0.1 },
      { day: "Thu", condition: "clear_skies", temp: 27, change: 0.5 },
      { day: "Fri", condition: "clear_skies", temp: 29, change: 1.45 },
      { day: "Sat", condition: "partly_cloudy", temp: 26, change: -0.1 },
      { day: "Sun", condition: "clear_skies", temp: 28, change: 0.4 }
    ]
  },
  {
    country: "Japan",
    code: "JP",
    indexName: "Nikkei 225",
    indexValue: 38721.50,
    indexChange: 0.68,
    condition: "partly_cloudy",
    temperature: 19, // moderate P/E
    pressure: 1016, // stable pressure
    humidity: 28, // low-to-medium volatility
    windSpeed: 24, // average volume
    alert: null,
    summary: "Pleasant light winds with scattered clouds. Shifting corporate governance updates are yielding gentle patches of sunshine.",
    economicAnalysis: "The Bank of Japan maintains its accommodative stance despite nominal exit from negative interest rates. A steady corporate governance push is bolstering foreign inflows, offset slightly by imported energy import inflation constraints.",
    outlook7Day: [
      { day: "Mon", condition: "partly_cloudy", temp: 18, change: 0.4 },
      { day: "Tue", condition: "cloudy", temp: 17, change: -0.1 },
      { day: "Wed", condition: "clear_skies", temp: 21, change: 1.2 },
      { day: "Thu", condition: "partly_cloudy", temp: 19, change: 0.68 },
      { day: "Fri", condition: "rainy", temp: 15, change: -0.5 },
      { day: "Sat", condition: "partly_cloudy", temp: 18, change: 0.2 },
      { day: "Sun", condition: "clear_skies", temp: 20, change: 0.9 }
    ]
  },
  {
    country: "India",
    code: "IN",
    indexName: "Nifty 50",
    indexValue: 22415.85,
    indexChange: 1.82,
    condition: "clear_skies",
    temperature: 32, // high hot valuation
    pressure: 1026, // robust confidence
    humidity: 18, // stable VIX
    windSpeed: 42, // intense volume
    alert: "MONSOON REBOUND WARNING: Extreme domestic heat. Infrastructure expenditures are fueling heavy tailwinds.",
    summary: "Stunning cloudless sunshine over Indian financial hubs. Scorching retail capital influx is generating powerful updrafts across mid-caps.",
    economicAnalysis: "India reports stellar 8.2% annual GDP expansion, cemented by high capital expenditure and sustained manufacturing strength. Domestic retail investors participate aggressively, outplaying minor global interest rate turbulence.",
    outlook7Day: [
      { day: "Mon", condition: "clear_skies", temp: 30, change: 1.1 },
      { day: "Tue", condition: "clear_skies", temp: 31, change: 1.3 },
      { day: "Wed", condition: "partly_cloudy", temp: 28, change: 0.3 },
      { day: "Thu", condition: "clear_skies", temp: 30, change: 1.0 },
      { day: "Fri", condition: "clear_skies", temp: 32, change: 1.82 },
      { day: "Sat", condition: "clear_skies", temp: 31, change: 0.9 },
      { day: "Sun", condition: "partly_cloudy", temp: 29, change: 0.2 }
    ]
  },
  {
    country: "Germany",
    code: "DE",
    indexName: "DAX 40",
    indexValue: 18650.22,
    indexChange: -0.12,
    condition: "cloudy",
    temperature: 15, // cool/average
    pressure: 1010, // flat barometric
    humidity: 42, // medium volatility
    windSpeed: 18, // thin trading volume
    alert: null,
    summary: "Stagnant overhead cloud cover. Flat production drafts have left exporting sectors becalmed with negligible drift.",
    economicAnalysis: "Subdued eurozone manufacturing PMIs hover around 45.4, showing persistent industrial slowdown. While stabilizing energy prices offer a relief vapor, weak consumer sentiment keeps industrial tailwinds fully neutralized.",
    outlook7Day: [
      { day: "Mon", condition: "partly_cloudy", temp: 16, change: 0.2 },
      { day: "Tue", condition: "cloudy", temp: 15, change: -0.1 },
      { day: "Wed", condition: "rainy", temp: 12, change: -0.6 },
      { day: "Thu", condition: "cloudy", temp: 14, change: -0.05 },
      { day: "Fri", condition: "cloudy", temp: 15, change: -0.12 },
      { day: "Sat", condition: "partly_cloudy", temp: 16, change: 0.3 },
      { day: "Sun", condition: "clear_skies", temp: 18, change: 0.8 }
    ]
  },
  {
    country: "United Kingdom",
    code: "GB",
    indexName: "FTSE 100",
    indexValue: 8352.12,
    indexChange: 0.05,
    condition: "cloudy",
    temperature: 13, // cool, historically lower historical P/E
    pressure: 1012, // neutral
    humidity: 35, // quiet volatility
    windSpeed: 14, // very low volume
    alert: null,
    summary: "Overcast with light drizzly fog. Defensive dividend yields are serving as an umbrella against global cyclical dampness.",
    economicAnalysis: "GDP growth bounces slightly above zero, signaling a transition out of shallow technical recession. Strong oil/commodity exports and a stable sterling protect mid-cap earnings from sharper international declines.",
    outlook7Day: [
      { day: "Mon", condition: "cloudy", temp: 13, change: 0.0 },
      { day: "Tue", condition: "rainy", temp: 11, change: -0.4 },
      { day: "Wed", condition: "cloudy", temp: 13, change: 0.1 },
      { day: "Thu", condition: "partly_cloudy", temp: 15, change: 0.3 },
      { day: "Fri", condition: "cloudy", temp: 13, change: 0.05 },
      { day: "Sat", condition: "partly_cloudy", temp: 14, change: 0.2 },
      { day: "Sun", condition: "cloudy", temp: 13, change: -0.02 }
    ]
  },
  {
    country: "France",
    code: "FR",
    indexName: "CAC 40",
    indexValue: 8022.90,
    indexChange: -0.85,
    condition: "rainy",
    temperature: 17, // premium pricing cooling off
    pressure: 1004, // low pressure rising
    humidity: 58, // damp volatility increasing
    windSpeed: 23, // steady selling volume
    alert: "WET FRONT ALERT: Consumer luxury sectors are taking on moisture due to weak foreign consumption gusts.",
    summary: "Steady cold front rain downpouring on blue chips. Luxury giants are seeing drops as high premium demand moistens down.",
    economicAnalysis: "Subdued consumer demand out of Chinese luxury markets hits major French fashion and cosmetic heavyweights directly. Escalating domestic fiscal deficit concerns raise political pressure barometers across the region.",
    outlook7Day: [
      { day: "Mon", condition: "cloudy", temp: 18, change: -0.1 },
      { day: "Tue", condition: "rainy", temp: 16, change: -0.5 },
      { day: "Wed", condition: "rainy", temp: 14, change: -0.9 },
      { day: "Thu", condition: "thunderstorms", temp: 11, change: -1.3 },
      { day: "Fri", condition: "rainy", temp: 17, change: -0.85 },
      { day: "Sat", condition: "cloudy", temp: 18, change: 0.1 },
      { day: "Sun", condition: "partly_cloudy", temp: 19, change: 0.4 }
    ]
  },
  {
    country: "China",
    code: "CN",
    indexName: "Shanghai Composite",
    indexValue: 2950.40,
    indexChange: -1.95,
    condition: "thunderstorms",
    temperature: 9, // extremely cold valuation / discounted
    pressure: 994, // very low stormy pressure
    humidity: 78, // severe high volatility
    windSpeed: 54, // gale force liquidation volume
    alert: "GALE WARNING: Real estate sector default risks lightning strikes have caused severe electric disruption in the banking grids.",
    summary: "Seismic financial thunderstorm with blinding lightning strikes. Violent property-sector storm wind currents are forcing protective liquidation.",
    economicAnalysis: "Continuing real estate restructuring bottlenecks and deflationary commodity metrics lower core interest forecasts. Weak capital confidence triggers panic-hedging cycles despite massive stabilization liquidity injections by central operators.",
    outlook7Day: [
      { day: "Mon", condition: "rainy", temp: 11, change: -0.8 },
      { day: "Tue", condition: "thunderstorms", temp: 9, change: -1.6 },
      { day: "Wed", condition: "thunderstorms", temp: 8, change: -2.1 },
      { day: "Thu", condition: "rainy", temp: 10, change: -0.7 },
      { day: "Fri", condition: "thunderstorms", temp: 9, change: -1.95 },
      { day: "Sat", condition: "cloudy", temp: 12, change: 0.1 },
      { day: "Sun", condition: "partly_cloudy", temp: 14, change: 0.5 }
    ]
  },
  {
    country: "Australia",
    code: "AU",
    indexName: "ASX 200",
    indexValue: 7780.10,
    indexChange: 0.35,
    condition: "partly_cloudy",
    temperature: 17, // fair valuation
    pressure: 1014, // balanced pressure
    humidity: 26, // stable VIX
    windSpeed: 19, // moderate volume
    alert: null,
    summary: "Gentle pacific ocean drafts with passing white clouds. Mining resource stocks are catching sunny rays as iron ore drifts higher.",
    economicAnalysis: "Strong iron ore and lithium exports to regional partners sustain resources sectors. Persistent domestic inflation compels the Reserve Bank of Australia to hold tight, dampening direct consumer/retail growth drafts.",
    outlook7Day: [
      { day: "Mon", condition: "clear_skies", temp: 19, change: 0.8 },
      { day: "Tue", condition: "partly_cloudy", temp: 18, change: 0.4 },
      { day: "Wed", condition: "cloudy", temp: 16, change: -0.2 },
      { day: "Thu", condition: "rainy", temp: 14, change: -0.5 },
      { day: "Fri", condition: "partly_cloudy", temp: 17, change: 0.35 },
      { day: "Sat", condition: "clear_skies", temp: 19, change: 0.7 },
      { day: "Sun", condition: "clear_skies", temp: 20, change: 1.1 }
    ]
  },
  {
    country: "Brazil",
    code: "BR",
    indexName: "IBOVESPA",
    indexValue: 124210.50,
    indexChange: -0.98,
    condition: "rainy",
    temperature: 10, // discounted/cold PE ratios
    pressure: 1002, // low pressure
    humidity: 62, // erratic volatility
    windSpeed: 31, // moderate-heavy volume
    alert: "TROPICAL DEPRESSION STRIKE: Fiscal budgeting instability winds are pushing resources indexes out to wet harbors.",
    summary: "Heavy humid cloudbursts over petro-chemical and agricultural indexes. Fiscal adjustments are creating sticky economic downpours.",
    economicAnalysis: "Heightened governmental budget deficits spur policy friction and currency depreciation in the Real. Weak immediate demand indicators for soy and iron commodities compound global risk premium markups.",
    outlook7Day: [
      { day: "Mon", condition: "partly_cloudy", temp: 12, change: 0.3 },
      { day: "Tue", condition: "rainy", temp: 10, change: -0.7 },
      { day: "Wed", condition: "rainy", temp: 9, change: -1.1 },
      { day: "Thu", condition: "cloudy", temp: 11, change: -0.2 },
      { day: "Fri", condition: "rainy", temp: 10, change: -0.98 },
      { day: "Sat", condition: "clear_skies", temp: 14, change: 0.8 },
      { day: "Sun", condition: "partly_cloudy", temp: 13, change: 0.4 }
    ]
  },
  {
    country: "Canada",
    code: "CA",
    indexName: "S&P/TSX Composite",
    indexValue: 22120.30,
    indexChange: 0.41,
    condition: "partly_cloudy",
    temperature: 16, // fair/cold
    pressure: 1015, // steady
    humidity: 21, // low volatility
    windSpeed: 21, // baseline volume
    alert: null,
    summary: "Crisp autumn weather with passing warm fields. Commodity and banking systems are sustaining high-pressure thermal ridges.",
    economicAnalysis: "Crude values standing solidly above $78/bbl stimulate central energy stocks. The Bank of Canada indicates inflation cooling is moving closer to targeted bands, giving banks comfortable respiratory space.",
    outlook7Day: [
      { day: "Mon", condition: "partly_cloudy", temp: 15, change: 0.2 },
      { day: "Tue", condition: "cloudy", temp: 14, change: -0.1 },
      { day: "Wed", condition: "clear_skies", temp: 18, change: 0.9 },
      { day: "Thu", condition: "partly_cloudy", temp: 16, change: 0.41 },
      { day: "Fri", condition: "rainy", temp: 13, change: -0.4 },
      { day: "Sat", condition: "partly_cloudy", temp: 15, change: 0.2 },
      { day: "Sun", condition: "clear_skies", temp: 17, change: 0.6 }
    ]
  }
];

// Helper to slightly randomize current values to simulate active dynamic weather
function getRandomizedCache(): MarketWeather[] {
  return marketCache.map(m => {
    // 0.05% fluctuation just to show active readings
    const scale = 1 + (Math.random() - 0.5) * 0.001;
    const value = parseFloat((m.indexValue * scale).toFixed(2));
    const delta = parseFloat((m.indexChange + (Math.random() - 0.5) * 0.1).toFixed(2));
    const humidityRandom = Math.floor(Math.max(10, Math.min(90, m.humidity + (Math.random() * 6 - 3))));
    const windRandom = Math.floor(Math.max(5, m.windSpeed + (Math.random() * 4 - 2)));
    return {
      ...m,
      indexValue: value,
      indexChange: delta,
      humidity: humidityRandom,
      windSpeed: windRandom
    };
  });
}

// REST API Endpoints

// 1. Get current markets
app.get("/api/markets", (req, res) => {
  res.json({
    status: "ok",
    isAiInteractive: !!ai,
    markets: getRandomizedCache()
  });
});

// 2. Generate custom or update weather report using Google Gemini API
app.post("/api/markets/generate", async (req, res) => {
  const { countryName, locale } = req.body;
  if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
    return res.status(400).json({ error: "Please provide a valid 'countryName' string." });
  }

  const isZh = locale === "zh";
  const cleanCountry = countryName.trim();
  console.log(`Starting Satellite Weather Scan for: ${cleanCountry} with locale: ${locale}`);

  // Base fallback details in case of simulated state (localized)
  const mockFallback = generateMockForecast(cleanCountry, isZh);

  if (!ai) {
    console.log(`Fallback option activated for ${cleanCountry}`);
    // Simulate minor latency as if the AI was computing
    await new Promise(resolve => setTimeout(resolve, 850));
    return res.json({
      status: "mock",
      isAiInteractive: false,
      data: mockFallback
    });
  }

  try {
    const prompt = `Develop a highly detailed and cohesive financial "Stock Market Weather Forecast Report" for the country: "${cleanCountry}". 
Analyze its real-world current core stock index (e.g. if Switzerland: SMI, if Canada: S&P/TSX, etc.), current economic state, inflation, interest rates, valuations, volatility, and transaction sizes.
Map economic traits to meteorological attributes beautifully as strictly instructed below:
- Index Value -> Current Air Pressure (Normal range 990-1035 hPa)
- Volatility (VIX type) -> Humidity percentage (10% to 90%, higher means high volatility)
- Price-Earnings / Valuations -> Air Temperature in °C (low valuation = <10°C, fair = 14-22°C, hot bubble/overvalued = >28°C)
- Trading Volume -> Wind speed absolute scale (km/h) (high volume = windy storm)
- Market Sentiment -> Primary Condition ('clear_skies' for strongly bullish/exuberant, 'partly_cloudy' for moderately bullish/stable, 'cloudy' for neutral/flat, 'rainy' for bearish outflow, 'thunderstorms' for crash/extreme sell-off panic).

${isZh ? "CRITICAL LANGUAGE REQUIREMENT: Since the user's language is Chinese (locale: zh), you MUST write ALL human-readable descriptions, text fields, and outcomes in Traditional Chinese (繁體中文). This includes translating the country name (e.g., 'United States' to '美國', 'Switzerland' to '瑞士', 'Singapore' to '新加坡', 'South Korea' to '南韓'), 'indexName' (e.g., 'S&P 500' to '標普500', 'Nikkei 225' to '日經225'), 'alert' warnings, 'summary' lines, and 'economicAnalysis' sentences. Do NOT return English or Simplified Chinese text for these fields." : ""}

Return the final results EXACTLY matching the provided JSON schema. Ensure realism regarding the real indices, codes (e.g., and actual historical index titles for that country).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the head of the Global Financial Meteorology Agency. You specialize in analyzing complex global macroeconomics and stock variables, and translating them into hilarious but highly accurate weather reports using meteorological metrics. Return your findings exclusively in the requested JSON schema format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            country: { type: Type.STRING, description: "Name of the country, capitalized securely (translated if Chinese is requested)" },
            code: { type: Type.STRING, description: "2-letter uppercase ISO country code, e.g. 'CH' for Switzerland, 'KR' for South Korea" },
            indexName: { type: Type.STRING, description: "Real notable head index of that country (translated if Chinese requested), e.g. SMI, KOSPI, S&P 500" },
            indexValue: { type: Type.NUMBER, description: "Approximate real or realistic current index spot price" },
            indexChange: { type: Type.NUMBER, description: "Daily percent change. Positive if clear_skies/partly_cloudy, negative if rainy/thunderstorms" },
            condition: { type: Type.STRING, description: "Must be exactly one of: 'clear_skies', 'partly_cloudy', 'cloudy', 'rainy', 'thunderstorms'" },
            temperature: { type: Type.NUMBER, description: "Market Temperature in °C corresponding to P/E or valuation state" },
            pressure: { type: Type.NUMBER, description: "Market pressure matching index level confidence in hPa" },
            humidity: { type: Type.NUMBER, description: "Volatility indicator from 10 to 95 percent" },
            windSpeed: { type: Type.NUMBER, description: "Relative index trade volume in km/h" },
            alert: { type: Type.STRING, description: "Thematic economic weather warning if critical, or empty string/null (written in Chinese if zh is requested)" },
            summary: { type: Type.STRING, description: "1-2 sentence witty summary matching weather conditions with current local finance vectors (written in Chinese if zh is requested)" },
            economicAnalysis: { type: Type.STRING, description: "Detailed 2-3 sentence analysis of real economy variables like inflation, central banks, or GDP driving this (written in Chinese if zh is requested)" },
            outlook7Day: {
              type: Type.ARRAY,
              description: "A 7-day weather trend outline starting from Mon or Tue",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "E.g. Mon, Tue, Wed, Thu, Fri, Sat, Sun" },
                  condition: { type: Type.STRING, description: "Exactly one of: 'clear_skies', 'partly_cloudy', 'cloudy', 'rainy', 'thunderstorms'" },
                  temp: { type: Type.NUMBER, description: "Expected day temperature in °C" },
                  change: { type: Type.NUMBER, description: "Expected index change percentage" }
                },
                required: ["day", "condition", "temp", "change"]
              }
            }
          },
          required: ["country", "code", "indexName", "indexValue", "indexChange", "condition", "temperature", "pressure", "humidity", "windSpeed", "summary", "economicAnalysis", "outlook7Day"]
        }
      }
    });

    const textResponse = response.text;
    console.log("Raw Satellite response received.");
    
    if (!textResponse) {
      throw new Error("Empty text response returned from Gemini.");
    }

    const payload = JSON.parse(textResponse.trim());
    
    // Quick sanitization of condition
    const validConditions = ['clear_skies', 'partly_cloudy', 'cloudy', 'rainy', 'thunderstorms'];
    if (!validConditions.includes(payload.condition)) {
      payload.condition = 'partly_cloudy';
    }
    
    // Save to server dynamic list if it matches an existing entry, to update cache
    const existingIndex = marketCache.findIndex(m => m.country.toLowerCase() === payload.country.toLowerCase() || m.code.toUpperCase() === payload.code.toUpperCase());
    if (existingIndex >= 0) {
      marketCache[existingIndex] = payload as MarketWeather;
    } else {
      // Append new custom countries that the user generates!
      marketCache.push(payload as MarketWeather);
    }

    return res.json({
      status: "success",
      isAiInteractive: true,
      data: payload
    });

  } catch (error: any) {
    console.error("Gemini scanning failure. Falling back to simulations:", error);
    return res.json({
      status: "fallback_recovery",
      isAiInteractive: false,
      errorMsg: error?.message || "Remote satellite communication jitter.",
      data: mockFallback
    });
  }
});

// Mock generator utility for seamless fallbacks
function generateMockForecast(country: string, isZh: boolean = false): MarketWeather {
  const norm = country.trim();
  const indexLookup: Record<string, { index: string; code: string; price: number; cond: string; zhCountry?: string; zhIndex?: string }> = {
    "switzerland": { index: "SMI", code: "CH", price: 11840.2, cond: "partly_cloudy", zhCountry: "瑞士", zhIndex: "瑞士SMI指數" },
    "south korea": { index: "KOSPI", code: "KR", price: 2712.5, cond: "rainy", zhCountry: "南韓", zhIndex: "南韓綜合指數" },
    "taiwan": { index: "TAIEX", code: "TW", price: 21540.8, cond: "clear_skies", zhCountry: "台灣", zhIndex: "台灣加權指數" },
    "mexico": { index: "IPC", code: "MX", price: 56120.3, cond: "cloudy", zhCountry: "墨西哥", zhIndex: "墨西哥IPC指數" },
    "singapore": { index: "STI", code: "SG", price: 3290.4, cond: "partly_cloudy", zhCountry: "新加坡", zhIndex: "新加坡海峽時報指數" },
    "russia": { index: "MOEX", code: "RU", price: 3120.5, cond: "thunderstorms", zhCountry: "俄羅斯", zhIndex: "俄羅斯MOEX指數" },
    "south africa": { index: "JSE Top 40", code: "ZA", price: 71490.6, cond: "cloudy", zhCountry: "南非", zhIndex: "南非JSE 40指數" },
    "italy": { index: "FTSE MIB", code: "IT", price: 34120.1, cond: "partly_cloudy", zhCountry: "義大利", zhIndex: "義大利MIB指數" }
  };

  const key = norm.toLowerCase();
  const matched = indexLookup[key];
  
  const details = matched || {
    index: `${norm.toUpperCase().slice(0, 3)} Composite`,
    code: norm.slice(0, 2).toUpperCase(),
    price: Math.floor(2000 + Math.random() * 15000),
    cond: ["clear_skies", "partly_cloudy", "cloudy", "rainy", "thunderstorms"][Math.floor(Math.random() * 5)],
    zhCountry: norm.charAt(0).toUpperCase() + norm.slice(1),
    zhIndex: `${norm.charAt(0).toUpperCase() + norm.slice(1)}綜合指數`
  };

  const changeMap: Record<string, number> = {
    "clear_skies": 1.45,
    "partly_cloudy": 0.45,
    "cloudy": -0.05,
    "rainy": -0.72,
    "thunderstorms": -2.31
  };

  const currentChange = changeMap[details.cond] || 0.15;
  const tempMap: Record<string, number> = {
    "clear_skies": 31,
    "partly_cloudy": 21,
    "cloudy": 14,
    "rainy": 9,
    "thunderstorms": 5
  };

  const sampleOutlook = [
    { day: "Mon", condition: details.cond as any, temp: tempMap[details.cond], change: currentChange },
    { day: "Tue", condition: "partly_cloudy", temp: 18, change: 0.3 },
    { day: "Wed", condition: "cloudy", temp: 15, change: -0.1 },
    { day: "Thu", condition: "clear_skies", temp: 24, change: 0.9 },
    { day: "Fri", condition: details.cond as any, temp: tempMap[details.cond] + 1, change: currentChange * 1.1 },
    { day: "Sat", condition: "partly_cloudy", temp: 17, change: 0.2 },
    { day: "Sun", condition: "cloudy", temp: 14, change: -0.05 }
  ];

  const countryDisplay = isZh && details.zhCountry ? details.zhCountry : (norm.charAt(0).toUpperCase() + norm.slice(1));
  const indexDisplay = isZh && details.zhIndex ? details.zhIndex : details.index;

  const condZhMap: Record<string, string> = {
    "clear_skies": "晴空萬里",
    "partly_cloudy": "晴間多雲",
    "cloudy": "陰天多雲",
    "rainy": "陰雨綿綿",
    "thunderstorms": "雷暴降臨"
  };

  const condText = isZh ? condZhMap[details.cond] : details.cond.replace('_', ' ');

  const summary = isZh 
    ? `經濟氣象動態監測信號顯示，${countryDisplay}當前的金融氣象狀態為【${condText}】。該地區金融大氣的氣壓梯度與資產熱度正在進行規律性結構調整。`
    : `Simulated weather reports signal ${condText} for ${countryDisplay}. The regional barometric metrics are adjusting.`;

  const economicAnalysis = isZh
    ? `隨機演化宏觀模型展示了${countryDisplay}的常規商品及跨國貿易流向。該經濟體當前的產業基礎穩固，正在經歷中央銀行規定的標準利率微調與資產情緒釋放區間。`
    : `Stochastic local model output maps general trade variables. Real-world structural parameters for ${countryDisplay} are stable but undergo standard central bank rate-setting humidity pressure.`;

  const alert = details.cond === "thunderstorms"
    ? (isZh ? "【強雷暴警報】局部性通貨膨脹對流在市場高空雲層爆發，請防範高空拋售避雷針反應。" : "STORM SIGNAL: Localized inflationary microbursts.")
    : null;

  return {
    country: countryDisplay,
    code: details.code,
    indexName: indexDisplay,
    indexValue: details.price,
    indexChange: currentChange,
    condition: details.cond as any,
    temperature: tempMap[details.cond],
    pressure: details.cond === "clear_skies" ? 1022 : (details.cond === "thunderstorms" ? 993 : 1011),
    humidity: details.cond === "clear_skies" ? 16 : (details.cond === "thunderstorms" ? 84 : 45),
    windSpeed: details.cond === "clear_skies" ? 35 : (details.cond === "thunderstorms" ? 64 : 18),
    alert: alert,
    summary,
    economicAnalysis,
    outlook7Day: sampleOutlook
  };
}

// Vite Config integration based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static files directory mapped.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Global Market Weather Visualizer Server active at: http://localhost:${PORT}`);
  });
}

startServer();

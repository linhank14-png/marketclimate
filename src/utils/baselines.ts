/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SovereignBaseline {
  peBaseline: number;        // Historical average P/E around 15°C
  peLabel: string;           // Asset valuation metric description
  vixBaseline: number;       // Average VIX volatility
  volumeBaseline: string;    // Normal trading volume indicator
  volumeUnit: string;        // Share or Currency volume identifier
  volumeBaselineVal: number; // Volume base index
}

export const SOVEREIGN_BASELINES: Record<string, SovereignBaseline> = {
  US: {
    peBaseline: 19.5,
    peLabel: "S&P 500 Historical PE",
    vixBaseline: 16.0,
    volumeBaseline: "110B",
    volumeUnit: "Shares",
    volumeBaselineVal: 3.2,
  },
  TW: {
    peBaseline: 16.5,
    peLabel: "TAIEX Historical PE",
    vixBaseline: 17.5,
    volumeBaseline: "320B",
    volumeUnit: "NTD",
    volumeBaselineVal: 3.2,
  },
  JP: {
    peBaseline: 16.0,
    peLabel: "Nikkei 225 Historical PE",
    vixBaseline: 18.0,
    volumeBaseline: "1.5B",
    volumeUnit: "Shares",
    volumeBaselineVal: 1.5,
  },
  CN: {
    peBaseline: 13.0,
    peLabel: "SHCOMP Historical PE",
    vixBaseline: 19.0,
    volumeBaseline: "38B",
    volumeUnit: "Shares",
    volumeBaselineVal: 35.0,
  },
  IN: {
    peBaseline: 22.5,
    peLabel: "Nifty 50 Historical PE",
    vixBaseline: 15.0,
    volumeBaseline: "1.2B",
    volumeUnit: "Shares",
    volumeBaselineVal: 1.2,
  },
  DE: {
    peBaseline: 14.0,
    peLabel: "DAX 40 Historical PE",
    vixBaseline: 17.0,
    volumeBaseline: "85M",
    volumeUnit: "Shares",
    volumeBaselineVal: 85.0,
  },
  GB: {
    peBaseline: 13.5,
    peLabel: "FTSE 100 Historical PE",
    vixBaseline: 16.0,
    volumeBaseline: "750M",
    volumeUnit: "Shares",
    volumeBaselineVal: 750.0,
  },
  FR: {
    peBaseline: 14.5,
    peLabel: "CAC 40 Historical PE",
    vixBaseline: 17.5,
    volumeBaseline: "90M",
    volumeUnit: "Shares",
    volumeBaselineVal: 90.0,
  },
  AU: {
    peBaseline: 15.5,
    peLabel: "ASX 200 Historical PE",
    vixBaseline: 16.5,
    volumeBaseline: "650M",
    volumeUnit: "Shares",
    volumeBaselineVal: 650.0,
  },
  BR: {
    peBaseline: 10.0,
    peLabel: "Ibovespa Historical PE",
    vixBaseline: 22.0,
    volumeBaseline: "4.5B",
    volumeUnit: "BRL",
    volumeBaselineVal: 4.5,
  },
  CA: {
    peBaseline: 15.0,
    peLabel: "S&P/TSX Historical PE",
    vixBaseline: 16.0,
    volumeBaseline: "350M",
    volumeUnit: "Shares",
    volumeBaselineVal: 350.0,
  },
  KR: {
    peBaseline: 11.5,
    peLabel: "KOSPI Historical PE",
    vixBaseline: 20.0,
    volumeBaseline: "550M",
    volumeUnit: "Shares",
    volumeBaselineVal: 550.0,
  },
  SG: {
    peBaseline: 12.5,
    peLabel: "STI Historical PE",
    vixBaseline: 14.0,
    volumeBaseline: "220M",
    volumeUnit: "Shares",
    volumeBaselineVal: 220.0,
  },
  SA: {
    peBaseline: 18.0,
    peLabel: "TASI Historical PE",
    vixBaseline: 15.0,
    volumeBaseline: "310M",
    volumeUnit: "SAR",
    volumeBaselineVal: 310.0,
  },
  MY: {
    peBaseline: 14.0,
    peLabel: "KLCI Historical PE",
    vixBaseline: 16.0,
    volumeBaseline: "2.8B",
    volumeUnit: "Shares",
    volumeBaselineVal: 2.8,
  },
  ID: {
    peBaseline: 14.5,
    peLabel: "IDX Comp Historical PE",
    vixBaseline: 17.0,
    volumeBaseline: "18B",
    volumeUnit: "Shares",
    volumeBaselineVal: 18.0,
  },
  TH: {
    peBaseline: 15.0,
    peLabel: "SET Historical PE",
    vixBaseline: 18.0,
    volumeBaseline: "12B",
    volumeUnit: "THB",
    volumeBaselineVal: 12.0,
  },
  MX: {
    peBaseline: 13.5,
    peLabel: "MEXBOL Historical PE",
    vixBaseline: 17.0,
    volumeBaseline: "250M",
    volumeUnit: "Shares",
    volumeBaselineVal: 250.0,
  },
  AR: {
    peBaseline: 8.5,
    peLabel: "Merval Historical PE",
    vixBaseline: 25.0,
    volumeBaseline: "45B",
    volumeUnit: "ARS",
    volumeBaselineVal: 45.0,
  },
  CL: {
    peBaseline: 12.0,
    peLabel: "IPSA Historical PE",
    vixBaseline: 16.0,
    volumeBaseline: "90M",
    volumeUnit: "Shares",
    volumeBaselineVal: 90.0,
  },
  CO: {
    peBaseline: 9.5,
    peLabel: "COLCAP Historical PE",
    vixBaseline: 18.0,
    volumeBaseline: "40B",
    volumeUnit: "COP",
    volumeBaselineVal: 40.0,
  },
  PE: {
    peBaseline: 11.0,
    peLabel: "BVL Historical PE",
    vixBaseline: 16.5,
    volumeBaseline: "35M",
    volumeUnit: "Shares",
    volumeBaselineVal: 35.0,
  },
  CH: {
    peBaseline: 16.0,
    peLabel: "SMI Historical PE",
    vixBaseline: 14.5,
    volumeBaseline: "65M",
    volumeUnit: "Shares",
    volumeBaselineVal: 65.0,
  },
  IT: {
    peBaseline: 10.5,
    peLabel: "FTSE MIB Historical PE",
    vixBaseline: 18.0,
    volumeBaseline: "280M",
    volumeUnit: "Shares",
    volumeBaselineVal: 280.0,
  },
  ES: {
    peBaseline: 12.5,
    peLabel: "IBEX 35 Historical PE",
    vixBaseline: 16.5,
    volumeBaseline: "180M",
    volumeUnit: "Shares",
    volumeBaselineVal: 180.0,
  },
  NL: {
    peBaseline: 15.0,
    peLabel: "AEX Historical PE",
    vixBaseline: 15.0,
    volumeBaseline: "75M",
    volumeUnit: "Shares",
    volumeBaselineVal: 75.0,
  },
  BE: {
    peBaseline: 13.0,
    peLabel: "BEL 20 Historical PE",
    vixBaseline: 15.5,
    volumeBaseline: "22M",
    volumeUnit: "Shares",
    volumeBaselineVal: 22.0,
  },
  SE: {
    peBaseline: 15.5,
    peLabel: "OMXS30 Historical PE",
    vixBaseline: 16.0,
    volumeBaseline: "120M",
    volumeUnit: "Shares",
    volumeBaselineVal: 120.0,
  },
  RU: {
    peBaseline: 5.5,
    peLabel: "MOEX Historical PE",
    vixBaseline: 24.0,
    volumeBaseline: "1.8B",
    volumeUnit: "RUB",
    volumeBaselineVal: 1.8,
  },
  TR: {
    peBaseline: 7.5,
    peLabel: "BIST 100 Historical PE",
    vixBaseline: 21.0,
    volumeBaseline: "3.4B",
    volumeUnit: "TRY",
    volumeBaselineVal: 3.4,
  },
  ZA: {
    peBaseline: 11.5,
    peLabel: "JSE Historical PE",
    vixBaseline: 18.5,
    volumeBaseline: "210M",
    volumeUnit: "Shares",
    volumeBaselineVal: 210.0,
  },
  EG: {
    peBaseline: 9.0,
    peLabel: "EGX 30 Historical PE",
    vixBaseline: 20.0,
    volumeBaseline: "160M",
    volumeUnit: "EGP",
    volumeBaselineVal: 160.0,
  },
  AE: {
    peBaseline: 14.0,
    peLabel: "DFM Historical PE",
    vixBaseline: 15.0,
    volumeBaseline: "140M",
    volumeUnit: "AED",
    volumeBaselineVal: 140.0,
  },
  PL: {
    peBaseline: 10.0,
    peLabel: "WIG20 Historical PE",
    vixBaseline: 17.5,
    volumeBaseline: "95M",
    volumeUnit: "PLN",
    volumeBaselineVal: 95.0,
  },
  AT: {
    peBaseline: 10.5,
    peLabel: "ATX Historical PE",
    vixBaseline: 16.5,
    volumeBaseline: "15M",
    volumeUnit: "Shares",
    volumeBaselineVal: 15.0,
  },
  HK: {
    peBaseline: 10.5,
    peLabel: "Hang Seng Historical PE",
    vixBaseline: 18.5,
    volumeBaseline: "110B",
    volumeUnit: "HKD",
    volumeBaselineVal: 110.0,
  },
  PH: {
    peBaseline: 13.0,
    peLabel: "PSEi Historical PE",
    vixBaseline: 17.5,
    volumeBaseline: "1.5B",
    volumeUnit: "PHP",
    volumeBaselineVal: 1.5,
  },
  VN: {
    peBaseline: 12.0,
    peLabel: "VN-Index Historical PE",
    vixBaseline: 18.0,
    volumeBaseline: "850M",
    volumeUnit: "Shares",
    volumeBaselineVal: 850.0,
  },
  NZ: {
    peBaseline: 16.5,
    peLabel: "NZX 50 Historical PE",
    vixBaseline: 14.0,
    volumeBaseline: "45M",
    volumeUnit: "Shares",
    volumeBaselineVal: 45.0,
  },
  PK: {
    peBaseline: 6.0,
    peLabel: "KSE 100 Historical PE",
    vixBaseline: 22.0,
    volumeBaseline: "120M",
    volumeUnit: "PKR",
    volumeBaselineVal: 120.0,
  },
};

/**
 * Derives the financial metrics precisely tailored to each country's unique benchmark
 */
export function deriveFinancialMetrics(
  countryCode: string,
  temperature: number, // Our 0-100 system (typically around 5 - 31 max)
  pressure: number, // around 993 - 1022 hPa
  humidity: number, // around 16 - 84 %
  windSpeed: number // around 18 - 64 km/h
) {
  const code = (countryCode || "US").toUpperCase();
  const base = SOVEREIGN_BASELINES[code] || SOVEREIGN_BASELINES.US;

  // 1. Valuation PE Calculation
  // 15°C corresponds exactly to the historical baseline P/E中樞.
  // Each 1°C warmth deviation maps to +4% in P/E valuation premium (expansion/bubbles), 
  // and cold maps to undervaluation discounts.
  const tempDeviation = temperature - 15;
  const impliedPE = parseFloat((base.peBaseline * (1 + tempDeviation * 0.04)).toFixed(1));
  const peRateChange = parseFloat((tempDeviation * 4).toFixed(1));

  // 2. Barometric Support Level
  // Standard atmospheric pressure is 1013 hPa, aligning with spot being on the 200-day EMA support line (100.0%)
  // Deviations map to price vs 200 EMA buffer%
  const hPaDeviation = pressure - 1013;
  // Let each 1 hPa represent 0.6% deviation from long-term support
  const indexVs200EMA = parseFloat((100 + hPaDeviation * 0.6).toFixed(1));

  // 3. Volatility Fear (VIX)
  // Humidity map directly scaled to the standard sovereign baseline VIX index
  const vixScaling = humidity / 45; // 45 is our neutral "cloudy" baseline humidity
  const impliedVIX = parseFloat((base.vixBaseline * vixScaling).toFixed(1));

  // 4. Volume Velocity (Trade wind power)
  // Base normal climate trade wind speed is 18 km/h.
  // If wind speed is 64km/h, trading volume turnover will be significantly elevated.
  const volMultiplier = windSpeed / 18;
  const impliedVolumePercent = Math.round(volMultiplier * 100);

  return {
    peBaseline: base.peBaseline,
    peLabel: base.peLabel,
    impliedPE,
    peRateChange,
    
    presBaseline: 1013,
    indexVs200EMA,
    
    vixBaseline: base.vixBaseline,
    impliedVIX,
    
    volMultiplier,
    impliedVolumePercent,
    volumeBaseline: base.volumeBaseline,
    volumeUnit: base.volumeUnit,
  };
}

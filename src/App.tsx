/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Compass,
  Cloud,
  Search,
  Activity,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Thermometer,
  Gauge,
  Droplets,
  Wind,
  Layers,
  Info,
  HelpCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { MarketWeather, WEATHER_METADATA, WeatherCondition } from "./types";
import WeatherIcon from "./components/WeatherIcon";
import ClimateInstrument from "./components/ClimateInstrument";
import WeatherTicker from "./components/WeatherTicker";
import SatelliteSearch from "./components/SatelliteSearch";
import OutlookForecastChart from "./components/OutlookForecastChart";

export default function App() {
  // Localization State
  const [locale, setLocale] = useState<"en" | "zh" | "zht">(() => {
    return (localStorage.getItem("market-weather-locale") as "en" | "zh" | "zht") || "en";
  });

  useEffect(() => {
    localStorage.setItem("market-weather-locale", locale);
  }, [locale]);

  const isZh = locale === "zh";
  const isZht = locale === "zht";

  // Application Data States
  const [markets, setMarkets] = useState<MarketWeather[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<MarketWeather | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  
  // UX Interaction States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCondition, setFilterCondition] = useState<WeatherCondition | "all">("all");
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Core Mappings & Translations
  const translateCountry = (country: string) => {
    if (!isZh && !isZht) return country;
    const map: Record<string, string> = {
      "United States": isZht ? "美國" : "美国",
      "United States of America": isZht ? "美國" : "美国",
      "Japan": isZht ? "日本" : "日本",
      "India": isZht ? "印度" : "印度",
      "Germany": isZht ? "德國" : "德国",
      "United Kingdom": isZht ? "英國" : "英国",
      "France": isZht ? "法國" : "法国",
      "China": isZht ? "中國" : "中国",
      "Australia": isZht ? "澳大利亞" : "澳大利亚",
      "Brazil": isZht ? "巴西" : "巴西",
      "Canada": isZht ? "加拿大" : "加拿大",
      "Switzerland": isZht ? "瑞士" : "瑞士",
      "South Korea": isZht ? "韓國" : "韩国",
      "Singapore": isZht ? "新加坡" : "新加坡",
      "Taiwan": isZht ? "台灣" : "台湾",
      "Mexico": isZht ? "墨西哥" : "墨西哥",
      "Russia": isZht ? "俄羅斯" : "俄罗斯",
      "South Africa": isZht ? "南非" : "南非",
      "Italy": isZht ? "義大利" : "意大利",
    };
    return map[country] || country;
  };

  const translateIndex = (index: string) => {
    if (!isZh && !isZht) return index;
    const map: Record<string, string> = {
      "S&P 505": isZht ? "標普500指數" : "标普500指数",
      "S&P 500": isZht ? "標普500指數" : "标普500指数",
      "Nikkei 225": isZht ? "日經225指數" : "日经225指数",
      "Nifty 50": isZht ? "印度Nifty 50指數" : "印度Nifty 50指数",
      "DAX 40": isZht ? "德國DAX 40指數" : "德国DAX 40指数",
      "FTSE 100": isZht ? "英國富時100指數" : "英国富时100指数",
      "CAC 40": isZht ? "法國CAC 40指數" : "法国CAC 40指数",
      "Shanghai Composite": isZht ? "上證綜合指數" : "上证综合指数",
      "ASX 200": isZht ? "澳大利亞ASX 200指數" : "澳大利亚ASX 200指数",
      "IBOVESPA": isZht ? "巴西IBOVESPA指數" : "巴西IBOVESPA指数",
      "S&P/TSX Composite": isZht ? "加拿大S&P/TSX綜合指數" : "加拿大S&P/TSX综合指数",
      "SMI": isZht ? "瑞士SMI指數" : "瑞士SMI指数",
      "KOSPI": isZht ? "韓國綜合指數" : "韩国综合指数",
      "TAIEX": isZht ? "台灣加權指數" : "台湾加权指数",
      "IPC": isZht ? "墨西哥IPC指數" : "墨西哥IPC指数",
      "STI": isZht ? "新加坡海峽時報指數" : "新加坡海峡时报指数",
      "MOEX": isZht ? "俄羅斯MOEX指數" : "俄罗斯MOEX指数",
      "JSE Top 40": isZht ? "南非JSE Top 40指數" : "南非JSE Top 40指数",
      "FTSE MIB": isZht ? "義大利MIB指數" : "意大利MIB指数"
    };
    return map[index] || index;
  };

  const getLocalizedSummary = (country: string, defaultSummary: string) => {
    if (!isZh && !isZht) return defaultSummary;
    const clean = country.trim();
    if (isZht) {
      const summaryMap: Record<string, string> = {
        "United States": "溫熱晴朗的高氣壓牛市，天空清澈。活躍的資本流入正為交易板塊煽起一系列樂觀前景的和風。",
        "Japan": "舒適的和風伴隨零星雲層。日本公司治理及再分配的穩步提振正為大盤投下一片和煦的微弱陽光。",
        "India": "印度本地金融樞紐上空陽光燦爛，碧空無雲。活躍的散戶與外資買氣正在為中盤股注入強勁的上升對流。",
        "Germany": "雲層滯留在上空，無風少動。扁平的工業與汽車出口需求使得股指幾乎原地無序漂流。",
        "United Kingdom": "濃霧微起，陰雨綿綿。高股息紅利防禦板塊正像雨傘一樣，抵禦著全球週期性出口降溫的侵襲。",
        "France": "一股冷鋒伴隨持續陣雨，襲擊大盤藍籌。海外市場高端消費偏好變動，正引來局部性降雨降溫。",
        "China": "金融氣象台錄得極度明顯的局部防空雷暴。部分重整中的地產信用違約電流使多頭遭受高空避雷針效應阻礙。",
        "Australia": "太平洋和煦微風和緩拂過，雲氣穩定。隨著鐵礦等資源價格築底回暖，採礦巨頭股正沐浴在充沛的日照中。",
        "Brazil": "石化與大豆期貨價格波動劇烈，引發連續暴雨。財政結構性預算赤字拖累了匯率氣壓梯度，讓短期估值承壓。",
        "Canada": "秋高氣爽，暖冬日照舒適。得益於國際原油堅守在78美元高空，主要能源信託大盤維持高勢晴空脊梁。"
      };
      return summaryMap[clean] || defaultSummary;
    } else {
      const summaryMap: Record<string, string> = {
        "United States": "温热晴朗的高气压牛市，天空清澈。活跃的资本流入正为交易板块煽起一系列乐观前景的和风。",
        "Japan": "舒适的和风伴随零星云层。日本公司治理及再分配的稳步提振正为大盘投下一片和煦的微弱阳光。",
        "India": "印度本地金融枢纽上空阳光灿烂，碧空无云。活跃的散户与外资买气正在为中盘股注入强劲的上升对流。",
        "Germany": "云层滞留在上空，无风少动。扁平的工业与汽车出口需求使得股指几乎原地无序漂流。",
        "United Kingdom": "浓雾微起，阴雨绵绵。高股息红利防御板块正像雨伞一样，抵御着全球周期性出口降温的侵袭。",
        "France": "一股冷锋伴随持续阵雨，袭击大盘蓝筹。海外市场高端消费偏好变动，正引来局部性降雨降温。",
        "China": "金融气象台录得极度明显的局部防空雷暴。部分重整中的地产信用违约电流使多头遭受高空避雷针效应阻碍。",
        "Australia": "太平洋和煦微风和缓拂过，云气稳定。随着铁矿等资源价格筑底回暖，采矿巨头股正沐浴在充沛的日照中。",
        "Brazil": "石化与大豆期货价格波动剧烈，引发连续暴雨。财政结构性预算赤字拖累了汇率气压梯度，让短期估值承压。",
        "Canada": "秋高气爽，暖冬日照舒适。得益于国际原油坚守在78美元高空，主要能源信托大盘维持高势晴空脊梁。"
      };
      return summaryMap[clean] || defaultSummary;
    }
  };

  const getLocalizedAnalysis = (country: string, defaultAnalysis: string) => {
    if (!isZh && !isZht) return defaultAnalysis;
    const clean = country.trim();
    if (isZht) {
      const analysisMap: Record<string, string> = {
        "United States": "第一季GDP強勁增長3.1%，就業報告表現堅韌。儘管核心CPI上漲2.8%略有粘性，但美聯儲釋放出的潛在降息預期刺激了科技與金融板塊的全面買盤。",
        "Japan": "儘管日本央行正式退出了負利率時代，但其依然宣布維持極度寬鬆的貨幣政策環境。本土治理結構改革不斷推進，使得海外中長期機構資金穩步流入。",
        "India": "印度第三季GDP年增率達8.2%傲視全場，主要得益於高額基建開支與穩定的先進製造需求。儘管美聯儲利率前景不明，但本土龐大的散戶買氣依舊對衝了國際市場的寒意。",
        "Germany": "歐元區工業PMI疲軟低走在45.4，折射出工業大國出口不振的冷空氣。雖然能源物價下降有所緩解，但消費情緒結冰導致大盤上漲勢能基本被中和。",
        "United Kingdom": "GDP錄得零以上的微弱正增長，助力英國經濟走出技術性淺衰退。堅挺的北海原油價格與穩定的英鎊走勢減慢了大盤跌幅。",
        "France": "全球奢侈品消費放緩直接拉低了法國時尚及彩妝巨頭的高額溢價估值。此外，本國財政赤字不確定性抬頭，也推升了區域主權風險的波動率氣壓儀度數。",
        "China": "不景氣的房企去槓桿對衝以及偏弱的大宗通縮數據，使市場預期貸款基準利率進一步向下修正。儘管國家隊多次入市注水融雪，散戶避險盤整依然明顯。",
        "Australia": "對主要貿易夥伴的煤礦與鋰資源出口堅固，支撐了大型礦產卡特爾的元氣。不過，由於本國通脹反彈，澳聯儲長期維持緊縮基調，壓制了零售與消費者指數。",
        "Brazil": "政府預算赤字走高，拖累了巴西雷亞爾的匯率走勢。與此同時，國際市場對於大豆和鐵礦石大宗商品的短期需求放緩，提高了整個新興拉丁美洲市盈率估值溢價。",
        "Canada": "國際原油價格堅守在每桶78美元上方，大幅提振了加國核心能源信託基金。加拿大央行暗示通脹正邁入2%的目標區間，緩解了加國六大行所承受的加息折舊壓力。"
      };
      return analysisMap[clean] || defaultAnalysis;
    } else {
      const analysisMap: Record<string, string> = {
        "United States": "第一季GDP强劲增长3.1%，就业报告表现坚韧。尽管核心CPI上涨2.8%略有粘性，但美联储释放出的潜在降息预期刺激了科技与金融板块的全面买盘。",
        "Japan": "尽管日本央行正式退出了负利率时代，但其依然宣布维持极度宽松的货币政策环境。本土治理结构改革不断推进，使得海外中长期机构资金稳步流入。",
        "India": "印度第三季GDP年增率达8.2%傲视全场，主要得益于高额基建开支与稳定的先进制造需求。尽管美联储利率前景不明，但本土庞大的散户买气依旧对冲了国际市场的寒意。",
        "Germany": "欧元区工业PMI疲软低走在45.4，折射出工业大国出口不振的冷空气。虽然能源物价下降有所缓解，但消费情绪结冰导致大盘上涨势能基本被中和。",
        "United Kingdom": "GDP录得零以上的微弱正增长，助力英国经济走出技术性浅衰退。坚挺 of 北海原油价格与稳定的英镑走势减慢了大盘跌幅。",
        "France": "全球奢侈品消费放缓直接拉低了法国时尚及彩妆巨头的高额溢价估值。此外，本国财政赤字不确定性抬头，也推升了区域主权风险的波动率气压仪度数。",
        "China": "不景气的房企去杠杆对冲以及偏弱的大宗通缩数据，使市场预期贷款基准利率进一步向下修正。尽管国家队多次入市注水融雪，散户避险盘整依然明显。",
        "Australia": "对主要贸易伙伴的煤矿与锂资源出口坚固，支撑了大型矿产卡特尔的元气。不过，由于本国通涨反弹，澳联储长期维持紧缩基调，压制了零售与消费者指数。",
        "Brazil": "政府预算赤字走高，拖累了巴西雷亚尔的汇率走势。与此同时，国际市场对于大豆和铁矿石大宗商品的短期需求放缓，提高了整个新兴拉丁美洲市盈率估值溢价。",
        "Canada": "国际原油价格坚守在每桶78美元上方，大幅提振了加国核心能源信託基金。加拿大银行暗示通胀正迈入2%的目标区间，缓解了加国六大行所承受的加息折旧压力。"
      };
      return analysisMap[clean] || defaultAnalysis;
    }
  };

  const getLocalizedAlert = (country: string, defaultAlert: string | null) => {
    if (!isZh && !isZht) return defaultAlert;
    if (!defaultAlert) return null;
    const clean = country.trim();
    if (isZht) {
      const alertMap: Record<string, string> = {
        "United States": "【多頭熱浪警報】大盤股指接連創下最新氣象高點。日照充足，上升買氣導致估值溫度有些偏高。",
        "India": "【季風順風警報】內需零售極其旺盛，估值溫度極熱。大型基建特許投資正如順風般托起實體經濟高點。",
        "France": "【多濕降溫警告】由於海外高定需求略有疲態，中盤消費股濕度反彈，部分獲利多頭正尋求打傘規避系統冷空氣。",
        "China": "【極強雷暴警報】房企信用承壓產生不連續電離，局部多頭遭受落雷，請緊密關注政策注水降噪及融雪方案。",
        "Brazil": "【熱帶低壓襲擾】財政槓桿調整受挫，政策流動性風向走弱，請防範資源板塊連帶濕滑波動風險。"
      };
      return alertMap[clean] || defaultAlert;
    } else {
      const alertMap: Record<string, string> = {
        "United States": "【多头热浪警报】大盘股指接连创下最新气象高点。日照充足，上升买气导致估值温度有些偏高。",
        "India": "【季风顺风警报】内需零售极其旺盛，估值温度极热。大批基建特许投资正如顺风般托起实体经济高点。",
        "France": "【多湿降温警告】由于海外高定需求略有疲态，中盘消费股湿度反弹，部分获利多头正寻求打伞规避系统冷空气。",
        "China": "【极强雷暴警报】房企信用承压产生不连续电离，局部多头遭受落雷，请紧密关注政策注水降噪及融雪方案。",
        "Brazil": "【热带低压袭扰】财政杠杆调整受挫，政策流动性风向走弱，请防范资源板块连带湿滑波动风险。"
      };
      return alertMap[clean] || defaultAlert;
    }
  };

  const getLocalizedWeatherMetadata = (cond: WeatherCondition) => {
    const base = WEATHER_METADATA[cond];
    if (!isZh && !isZht) return base;

    const overridesZh: Record<WeatherCondition, { label: string; description: string; marketStance: string }> = {
      clear_skies: {
        label: "晴空万里",
        description: "牛市高位。资本极度疯狂涌入，盈利指标加速超常膨胀，大盘顺风充沛，估值与指数气压一路飘红上升。",
        marketStance: "极度看涨 (买入热潮)"
      },
      partly_cloudy: {
        label: "晴间多云",
        description: "温和看涨。宏观基本面大体表现稳健，主要估值平稳抬升，多空双方在部分政策微风区间呈健康震荡态势。",
        marketStance: "温和看涨 (适度成长)"
      },
      cloudy: {
        label: "阴天多云",
        description: "平稳横盘。市场缺乏实质利好驱动，资金观望情绪浓厚，大盘波动率维持在中性盘整区间，几乎无风漂流。",
        marketStance: "中性横盘 (窄幅整理)"
      },
      rainy: {
        label: "阴雨绵绵",
        description: "适度看跌。由于部分产业利润遭遇雨淋缩水，以及债务成本反弹，部分外资机构正采取防御性资本减码避风。",
        marketStance: "温和看跌 (资本外流)"
      },
      thunderstorms: {
        label: "雷暴降临",
        description: "恐慌跌落。重度信用危机与负面抛售形成剧烈对流，雷击频发，恐慌指数湿度爆表，大盘呈避险砸盘恐慌态势。",
        marketStance: "深度看跌 (恐慌抛售)"
      }
    };

    const overridesZht: Record<WeatherCondition, { label: string; description: string; marketStance: string }> = {
      clear_skies: {
        label: "晴空萬里",
        description: "牛市高位。資本極度瘋狂湧入，盈利指標加速超常膨脹，大盤順風充沛，估值與指數氣壓一路飄紅上升。",
        marketStance: "極度看漲 (買入熱潮)"
      },
      partly_cloudy: {
        label: "晴間多雲",
        description: "溫和看漲。宏觀基本面大體表現穩健，主要估值平穩抬升，多空雙方在部分政策微風區間呈健康震盪態勢。",
        marketStance: "溫和看漲 (適度成長)"
      },
      cloudy: {
        label: "陰天多雲",
        description: "平穩橫盤。市場缺乏實質利好驅動，資金觀望情緒濃厚，大盤波動率維持在中性盤整區間，幾乎無風飄流。",
        marketStance: "中性橫盤 (窄幅整理)"
      },
      rainy: {
        label: "陰雨綿綿",
        description: "適度看跌。由於部分產業利潤遭遇雨淋縮水，以及債務成本反彈，部分外資機構正採取防禦性資本減碼避風。",
        marketStance: "溫和看跌 (資本外流)"
      },
      thunderstorms: {
        label: "雷暴降臨",
        description: "恐慌跌落。重度信用危機與負面拋售形成劇烈對流，雷擊頻發，恐慌指數濕度爆表，大盤呈避險砸盤恐慌態勢。",
        marketStance: "深度看跌 (恐慌拋售)"
      }
    };

    return {
      ...base,
      ...(isZht ? overridesZht[cond] : overridesZh[cond])
    };
  };

  // Load baseline markets on mount
  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setIsInitialLoading(true);
      const response = await fetch("/api/markets");
      if (!response.ok) {
        throw new Error("Failed to contact meteorological master server.");
      }
      const data = await response.json();
      setMarkets(data.markets || []);
      setIsAiEnabled(data.isAiInteractive || false);
      
      // Auto-set initial selected country (US if present, else first available)
      if (data.markets && data.markets.length > 0) {
        const usMarket = data.markets.find((m: MarketWeather) => m.code === "US");
        setSelectedCountry(usMarket || data.markets[0]);
      }
    } catch (error) {
      console.error("Baseline fetch failed:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Dedicated single-country refresh scan
  const handleSingleRefresh = async () => {
    if (!selectedCountry) return;
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/markets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: selectedCountry.country, locale })
      });

      if (!response.ok) {
        throw new Error(isZh ? "目标探测卫星报告遭遇极端强烈的大气电离干扰。" : "Target satellite reported heavy atmospheric interference.");
      }

      const resData = await response.json();
      if (resData.data) {
        // Update local arrays cleanly
        const updatedMarket: MarketWeather = resData.data;
        setMarkets(prev =>
          prev.map(m => m.country.toLowerCase() === updatedMarket.country.toLowerCase() ? updatedMarket : m)
        );
        setSelectedCountry(updatedMarket);
      }
    } catch (error) {
      console.error("Refresh scan failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScanComplete = (newMarket: MarketWeather) => {
    // Add or update matching entries
    setMarkets(prev => {
      const exists = prev.some(m => m.country.toLowerCase() === newMarket.country.toLowerCase());
      if (exists) {
        return prev.map(m => m.country.toLowerCase() === newMarket.country.toLowerCase() ? newMarket : m);
      } else {
        return [...prev, newMarket];
      }
    });
    setSelectedCountry(newMarket);
  };

  // Flag renderer utility
  const getFlagEmoji = (code: string) => {
    try {
      if (!code || code.length !== 2) return "🌐";
      const codePoints = code
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🌐";
    }
  };

  // Filter & search logic
  const filteredMarkets = markets.filter((m) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      m.country.toLowerCase().includes(term) ||
      m.indexName.toLowerCase().includes(term) ||
      translateCountry(m.country).toLowerCase().includes(term) ||
      translateIndex(m.indexName).toLowerCase().includes(term);
    const matchesFilter = filterCondition === "all" || m.condition === filterCondition;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-650 selection:text-white" id="main_wrapper">
      {/* 1. Global Scrolling Market Ticker */}
      {!isInitialLoading && markets.length > 0 && (
        <WeatherTicker markets={markets} onSelectCountry={(c) => setSelectedCountry(c)} />
      )}

      {/* 2. Top Header Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-4 sm:px-8 py-5 sticky top-0 z-30 backdrop-blur-md" id="header_nav">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
              <svg xmlns="http://www.w3.org/2500/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-display flex items-center gap-2">
                MarketClimate
              </h1>
              <p className="text-xs text-slate-404 text-slate-400 uppercase tracking-widest font-semibold font-mono">
                {isZh ? "全球经济天气预警与雷达指数" : "Global Economic Weather Forecast"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="hidden md:flex gap-6 items-center">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">{isZh ? "微气象处理器状态" : "System Intel Status"}</div>
                <div className="text-emerald-400 font-bold text-xs uppercase tracking-tight">{isZh ? "极轨道卫星天线运行" : "Active Satellite Feed"}</div>
              </div>
              <div className="h-8 w-px bg-slate-850"></div>
              <div className="flex items-center gap-2 bg-slate-800/40 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {isZh ? "实时遥测中" : "Live Scanning"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector Pill Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setLocale("en")}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    locale === "en" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-300"
                  }`}
                  id="lang_en_btn"
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale("zh")}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    locale === "zh" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-300"
                  }`}
                  id="lang_zh_btn"
                >
                  简体
                </button>
                <button
                  onClick={() => setLocale("zht")}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    locale === "zht" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-300"
                  }`}
                  id="lang_zht_btn"
                >
                  繁體
                </button>
              </div>

              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-all cursor-pointer font-medium"
                id="guide_modal_trigger"
              >
                <Info size={14} className="text-blue-400" />
                <span>{isZh ? "指标指南" : "Guide & Legend"}</span>
              </button>

              <button
                onClick={fetchMarkets}
                disabled={isInitialLoading}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-750 transition-all cursor-pointer disabled:opacity-50"
                title={isZh ? "重新标定全局气候" : "Recalibrate All Telemetry"}
                id="recalibrate_trigger"
              >
                <RotateCw size={14} className="text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Cockpit */}
      {isInitialLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20" id="initial_loader">
          <Layers className="animate-bounce text-blue-400 mb-4" size={40} />
          <h3 className="text-sm uppercase tracking-widest font-mono text-slate-400">
            {isZh ? "正在标定智能微气象驾驶舱..." : "Calibrating Meteorological Cockpit..."}
          </h3>
          <p className="text-xs text-slate-600 mt-2">{isZh ? "正在接入日地多极同步轨道商业卫星星座。" : "Connecting with solar orbital macro nodes."}</p>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE PANEL - Market Directory Ticker Cockpit (35% width on desktop) */}
          <section className="w-full lg:w-[35%] flex flex-col gap-5 shrink-0" id="directory_cockpit">
            
            {/* Satellite Search Console */}
            <SatelliteSearch onScanComplete={handleScanComplete} isAiEnabled={isAiEnabled} locale={locale} />

            {/* Quick Directory Filter */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6" id="quick_filter_panel">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider">
                  {isZh ? "经济气压带检索空间" : "Atmospheric Filter Space"}
                </span>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                  {isZh ? `定位至 ${filteredMarkets.length} 个活跃气旋` : `${filteredMarkets.length} Zones detected`}
                </span>
              </div>
              
              {/* Filter pills */}
              <div className="flex flex-wrap gap-1.5 mb-4" id="filter_pills_container">
                {(["all", "clear_skies", "partly_cloudy", "cloudy", "rainy", "thunderstorms"] as const).map((cond) => {
                  const isActive = filterCondition === cond;
                  const label = cond === "all" 
                    ? (isZh ? "全部气候" : "All Zones") 
                    : getLocalizedWeatherMetadata(cond).label;
                  return (
                    <button
                      key={cond}
                      onClick={() => setFilterCondition(cond)}
                      className={`text-[10px] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/10"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                      id={`filter_pill_${cond}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Text Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder={isZh ? "输入任何国名或指数代号 (例如: 瑞士, S&P 500)..." : "Quick search index or country..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
                  id="satellite_text_search"
                />
              </div>
            </div>

            {/* Weather Directory List */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 overflow-hidden flex-1 max-h-[580px] flex flex-col" id="weather_directory_list_wrapper">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider mb-4 block">
                {isZh ? "全球金融大气读数目录" : "Atmospheric Directory Readings"}
              </span>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1" id="directories_scroll_area">
                {filteredMarkets.length === 0 ? (
                  <div className="text-center py-10" id="no_matches_found_fallback">
                    <Cloud className="mx-auto text-slate-700 animate-pulse mb-2" size={32} />
                    <p className="text-xs text-slate-505 text-slate-500 font-mono">
                      {isZh ? "当前筛选条件下无气象匹配目标。" : "No atmospheric zones match query."}
                    </p>
                  </div>
                ) : (
                  filteredMarkets.map((market) => {
                    const isSelected = selectedCountry?.country === market.country;
                    const meta = getLocalizedWeatherMetadata(market.condition);
                    const isPositive = market.indexChange >= 0;

                    // Progress bar values and colors mirroring the visual sidebar design
                    const pctVal = Math.max(15, Math.min(95, market.humidity));
                    const barColor = 
                      market.condition === "clear_skies" ? "bg-emerald-500" :
                      market.condition === "partly_cloudy" ? "bg-blue-400" :
                      market.condition === "cloudy" ? "bg-slate-400" :
                      market.condition === "rainy" ? "bg-amber-500" : "bg-rose-500";

                    const badgeEmoji = 
                      market.condition === "clear_skies" ? "☀️" :
                      market.condition === "partly_cloudy" ? "⛅" :
                      market.condition === "cloudy" ? "☁️" :
                      market.condition === "rainy" ? "🌧️" : "⛈️";

                    return (
                      <button
                        key={market.code}
                        onClick={() => setSelectedCountry(market)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                          isSelected
                            ? "bg-slate-800 border-blue-500/80 shadow-lg shadow-blue-500/5 border-l-4 border-l-blue-500"
                            : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                        }`}
                        id={`directory_item_${market.code}`}
                      >
                        <span className="text-3xl shrink-0 selection:bg-none select-none">{badgeEmoji}</span>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                              <span>{getFlagEmoji(market.code)}</span>
                              <span>{translateCountry(market.country)}</span>
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono shrink-0 font-bold">
                              {market.indexValue.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pctVal}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <p className={`text-[9.5px] uppercase tracking-tighter font-bold font-mono ${
                              market.condition === "clear_skies" ? "text-emerald-400" :
                              market.condition === "partly_cloudy" ? "text-blue-400" :
                              market.condition === "cloudy" ? "text-slate-400" :
                              market.condition === "rainy" ? "text-amber-400" : "text-rose-500"
                            }`}>
                              {meta.marketStance} • {meta.label}
                            </p>
                            <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositive ? "+" : ""}{market.indexChange}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* RIGHT SIDE PANEL - Focus Meteorological Station (65% width) */}
          <section className="flex-1 flex flex-col gap-6" id="focus_station">
            {selectedCountry ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full" id="focus_station_card">
                
                {/* Visual Sky Banner Header - Premium Primary Forecast Card design */}
                <div className={`p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br ${
                  selectedCountry.condition === "clear_skies" ? "from-amber-400 to-orange-600 shadow-amber-900/10" :
                  selectedCountry.condition === "partly_cloudy" ? "from-blue-500 to-indigo-600 shadow-blue-900/10" :
                  selectedCountry.condition === "cloudy" ? "from-slate-600 to-slate-800 shadow-slate-900/10" :
                  selectedCountry.condition === "rainy" ? "from-sky-700 to-indigo-950 shadow-indigo-950/10" :
                  "from-rose-800 to-slate-950 shadow-rose-950/10"
                }`} id="weather_gradient_banner">

                  {/* Glowing decorative ambient blob */}
                  <div className={`absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl ${
                    selectedCountry.condition === "clear_skies" ? "bg-yellow-300/20" :
                    selectedCountry.condition === "partly_cloudy" ? "bg-white/20" :
                    selectedCountry.condition === "cloudy" ? "bg-slate-300/20" :
                    selectedCountry.condition === "rainy" ? "bg-blue-300/20" :
                    "bg-rose-400/20"
                  }`}></div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 inline-block">
                        {isZh ? "推荐监测区域" : "Featured Met Region"} • {getFlagEmoji(selectedCountry.code)} {translateCountry(selectedCountry.country)}
                      </span>
                      <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight font-display">
                        {translateIndex(selectedCountry.indexName)}
                        <br />
                        <span className="text-white/80 font-bold text-2xl sm:text-3xl font-sans mt-1 block">
                          {getLocalizedWeatherMetadata(selectedCountry.condition).label}
                        </span>
                      </h2>
                      
                      <div className="mt-8 flex items-end gap-3 flex-wrap">
                        <span className="text-5xl sm:text-6xl font-light text-white font-mono tracking-tight leading-none" id="focused_index_value">
                          {selectedCountry.indexValue.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                        </span>
                        <div className={`mb-1.5 flex items-center gap-1 bg-white/20 border border-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black ${
                          selectedCountry.indexChange >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`} id="focused_index_change">
                          {selectedCountry.indexChange >= 0 ? <TrendingUp size={14} className="text-emerald-300" /> : <TrendingDown size={14} className="text-rose-300" />}
                          {selectedCountry.indexChange >= 0 ? "+" : ""}{selectedCountry.indexChange}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center self-center md:self-end text-center shrink-0">
                      <div className="text-[100px] leading-none mb-2 drop-shadow-2xl select-none animate-float">
                        {selectedCountry.condition === "clear_skies" && "☀️"}
                        {selectedCountry.condition === "partly_cloudy" && "⛅"}
                        {selectedCountry.condition === "cloudy" && "☁️"}
                        {selectedCountry.condition === "rainy" && "🌧️"}
                        {selectedCountry.condition === "thunderstorms" && "⛈️"}
                      </div>
                      <p className="text-white font-bold uppercase tracking-wider text-[10px] bg-black/25 backdrop-blur-sm px-3 py-1 border border-white/10 rounded-full font-mono">
                        {getLocalizedWeatherMetadata(selectedCountry.condition).marketStance}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Mini Forecast Track matching Design HTML */}
                  <div className="mt-10 grid grid-cols-7 gap-2 z-10 relative" id="seven_day_mini_forecast">
                    {selectedCountry.outlook7Day.map((dayItem, idx) => {
                      const dayEmoji = 
                        dayItem.condition === "clear_skies" ? "☀️" :
                        dayItem.condition === "partly_cloudy" ? "⛅" :
                        dayItem.condition === "cloudy" ? "☁️" :
                        dayItem.condition === "rainy" ? "🌧️" : "⛈️";
                      
                      const isMid = idx === 3; // Midweek highlight
                      const getLocalizedDay = (day: string) => {
                        if (!isZh) return day;
                        const map: Record<string, string> = {
                          "Mon": "周一", "Tue": "周二", "Wed": "周三", "Thu": "周四", "Fri": "周五", "Sat": "周六", "Sun": "周日"
                        };
                        return map[day] || day;
                      };

                      return (
                        <div 
                          key={dayItem.day} 
                          className={`py-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                            isMid 
                              ? "bg-white/20 border-white/30 backdrop-blur-md" 
                              : "bg-white/10 border-white/5"
                          }`}
                        >
                          <span className={`text-[9px] mb-0.5 uppercase font-mono font-extrabold ${isMid ? "text-white" : "text-white/60"}`}>
                            {getLocalizedDay(dayItem.day)}
                          </span>
                          <span className="text-lg leading-none mb-0.5 selection:bg-none">{dayEmoji}</span>
                          <span className="text-[9px] text-white/95 font-mono font-medium">{dayItem.temp}°</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Flashing Weather warning alerts */}
                {selectedCountry.alert && (
                  <div className="bg-orange-950/20 border-y border-orange-900/30 px-5 py-3 flex items-center gap-3 text-orange-300" id="met_warning_banner">
                    <AlertTriangle className="animate-pulse shrink-0" size={18} />
                    <div className="text-xs font-mono">
                      <span className="font-bold uppercase tracking-wider text-orange-400 block sm:inline mr-1">
                        {isZh ? "金融气候异常预警提示：" : "WEATHER ALERT WARNING:"}
                      </span>
                      {getLocalizedAlert(selectedCountry.country, selectedCountry.alert)}
                    </div>
                  </div>
                )}

                {/* Inner Data Section */}
                <div className="p-6 space-y-6 flex-1">
                  
                  {/* Climate Instruments Grid */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-3">
                      {isZh ? "金融气候仪表雷达方阵" : "Atmospheric Gauge Array"}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="instruments_grid">
                      {/* 1. Temp (Valuation P/E Gauge) */}
                      <ClimateInstrument
                        label={isZh ? "温感热力值" : "Thermal Metrics"}
                        financialMeasure={isZh ? "大盘市盈率估值温度 (PE)" : "Market Valuation P/E"}
                        value={`${selectedCountry.temperature}°`}
                        unit={isZh ? "摄氏温标" : "C Scale"}
                        percentage={(selectedCountry.temperature / 40) * 105}
                        theme={selectedCountry.temperature > 28 ? "rose" : selectedCountry.temperature < 12 ? "blue" : "amber"}
                        icon={<Thermometer size={16} />}
                        description={isZh 
                          ? "映射资产定价充沛感。超买买气引发极端高空温热（>28°C），估值低廉则下跌进入局部冰冻或负温气流。" 
                          : "Represents asset pricing temperature. Over-expansionary buy rushes create extreme hot airwaves (>28°C), while cheap valuations drop into freezing drafts."}
                        id="gauge_temperature"
                      />

                      {/* 2. Index Barometric Pressure */}
                      <ClimateInstrument
                        label={isZh ? "气旋势图系统" : "Barometric Systems"}
                        financialMeasure={isZh ? "股指大盘支撑气压 (Pres)" : "Index Air Pressure"}
                        value={selectedCountry.pressure}
                        unit="hPa"
                        percentage={((selectedCountry.pressure - 980) / 60) * 100}
                        theme="emerald"
                        icon={<Gauge size={16} />}
                        description={isZh 
                          ? "体现市场系统动力支撑度。高气压势（>1013hPa）维持晴空横盘或震荡上攀；低空强气流对流则引来暴风雨。" 
                          : "Expresses systemic momentum & barometric force. High pressure (>1013hPa) produces calm, buoyant bullish skies; low pressures trigger stormy winds."}
                        id="gauge_pressure"
                      />

                      {/* 3. VIX Humidity */}
                      <ClimateInstrument
                        label={isZh ? "电离层空气湿度" : "Moisture Saturation"}
                        financialMeasure={isZh ? "恐慌情绪波动湿度 (VIX)" : "Volatility Humidity (VIX)"}
                        value={`${selectedCountry.humidity}%`}
                        unit={isZh ? "波幅单位" : "VIX Index"}
                        percentage={selectedCountry.humidity}
                        theme="blue"
                        icon={<Droplets size={16} />}
                        description={isZh 
                          ? "空气湿度正比于大盘恐慌波幅（VIX）。水分饱和（湿度>60%）是酝酿剧烈结构性变盘和极端冰雹的催化剂。" 
                          : "Equivalent to VIX. High relative moisture saturation (>60% humidity) signifies massive storm potential and volatility breed grounds."}
                        id="gauge_humidity"
                      />

                      {/* 4. volume wind speed */}
                      <ClimateInstrument
                        label={isZh ? "多空资金流速" : "Kinetic Velocity"}
                        financialMeasure={isZh ? "席位成交总信风速 (Vol)" : "Trade Gale Wind Speed"}
                        value={`${selectedCountry.windSpeed}`}
                        unit="km/h"
                        percentage={(selectedCountry.windSpeed / 80) * 100}
                        theme="slate"
                        icon={<Wind size={16} />}
                        description={isZh 
                          ? "指示30日平均成交换手量风速。多空大风（>45 km/h）表示主要席位资金正在剧烈多空转换、清盘或顺风流入。" 
                          : "Represents 30-day average trading volume speeds. Gale-force gale winds (>45 km/h) reflect heavy institutional liquidity liquidations or storm inflows."}
                        id="gauge_wind"
                      />
                    </div>
                  </div>

                  {/* Satellite Report Narrative (Gemini generated analysis) */}
                  <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-3xl" id="satellite_briefing_narrative">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-blue-400 animate-pulse" size={14} />
                        <h3 className="text-xs text-blue-300 font-mono font-bold uppercase tracking-wider">
                          {isZh ? "高层探测卫星实时天气简报" : "Remote Satellite Weather Scan"}
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                        {isZh ? "遥测核心：普罗米修斯AI" : "RESOLVER: PROMETHEUS AI"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Metaphoric Summary */}
                      <div className="text-sm font-semibold text-slate-100 italic pl-4 border-l-2 border-blue-500 leading-relaxed" id="narrative_metaphor_summary">
                        "{getLocalizedSummary(selectedCountry.country, selectedCountry.summary)}"
                      </div>
                      
                      {/* Economic Details */}
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                          {isZh ? "微气象台宏观基本面气候会商分析" : "Meteorological Deep Climate Analysis"}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans" id="narrative_macro_details">
                          {getLocalizedAnalysis(selectedCountry.country, selectedCountry.economicAnalysis)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 7-day outlook chart (Recharts) */}
                  <OutlookForecastChart data={selectedCountry.outlook7Day} isZh={isZh} />

                  {/* Operational Action Panel */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl">
                    <div className="text-center sm:text-left">
                      <h4 className="text-xs font-bold text-slate-300">
                        {isZh ? "针对性雷达传感器重标定" : "Target Scanner Radar Recalibration"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isZh ? "发射多极射频至该重点探测气区，以获取高精度、即时的气压和交易湿度动态预报。" : "Query targeted economic satellites for an instant real-time forecast update."}
                      </p>
                    </div>

                    <button
                      onClick={handleSingleRefresh}
                      disabled={isRefreshing}
                      className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-55 shadow-md shadow-blue-500/10"
                      id="single_refresh_scan_btn"
                    >
                      <RotateCw className={`shrink-0 ${isRefreshing ? "animate-spin text-white" : ""}`} size={12} />
                      {isRefreshing 
                        ? (isZh ? "正在计算多极气旋..." : "Scanning Atmosphere...") 
                        : (isZh ? "立即启动重标定遥测" : "Recalibrate Scan")}
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl h-full flex flex-col items-center justify-center py-24 text-center p-8 shadow-inner" id="dormant_station_card">
                <Compass className="animate-float text-blue-400/40 mb-4" size={48} />
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                  {isZh ? "探测气象台处于休眠状态" : "Atmospheric Station Dormant"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                  {isZh 
                    ? "请在左侧金融气压目录中选定任意国家指数，或在顶端轨道探测台键入指定地名国名，绘制对应宏观气候趋势盘整图。" 
                    : "Select a national market sector index on the left directory map or launch an AI satellite search scan to inspect atmospheric indicators."}
                </p>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Guide/Legend Modal Popup */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" id="guide_legend_modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3 font-display">
              {isZh ? "金融气象学分析指导与图例说明" : "Financial Meteorology Guide & Legend"}
            </h3>
            
            <div className="space-y-4">
              <section className="space-y-2">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                  {isZh ? "气相Sentiment温区状态划分" : "Climate Zones (Sentiment Mapping)"}
                </h4>
                
                <div className="space-y-2.5">
                  {(["clear_skies", "partly_cloudy", "cloudy", "rainy", "thunderstorms"] as const).map((cond) => {
                    const meta = getLocalizedWeatherMetadata(cond);
                    return (
                      <div key={cond} className="flex gap-3 items-start p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
                        <WeatherIcon condition={cond} size={18} className="shrink-0 mt-0.5" />
                        <div>
                          <span className={`text-xs font-bold ${meta.textColor}`}>{meta.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">[{meta.marketStance}]</span>
                           <p className="text-[11px] text-slate-400 mt-1">{meta.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-1.5 border-t border-slate-800 pt-3">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                  {isZh ? "微气象气旋观察仪引用手册" : "Atmospheric Instruments Reference"}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 mt-1 font-sans">
                  <div>
                    <span className="font-bold text-slate-200 block">🌡️ {isZh ? "平均市盈率温度 (PE)" : "Valuation Temp"}:</span>
                    {isZh ? "表征资产整体估值热度。超买导致温度升高处于酷暑，估值过于低廉则呈冷冻甚至负温。" : "Price-earnings averages. Hot indicates market overextension risk, while freezing represents bargain discounts."}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">🌀 {isZh ? "支撑气压阻尼 (hPa)" : "Barometric Pressure"}:</span>
                    {isZh ? "表征指数长期多头抵抗力。平稳高气压孕育温和看涨，低压则在宏观雷区中带来恐慌跌落。" : "Baseline momentum indicator. Buoyant high pressures create stable bulls; storming lows trigger sell plunges."}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">💧 {isZh ? "波动空气湿度 (VIX)" : "Volatility Humidity"}:</span>
                    {isZh ? "与大盘波动率指数VIX重合。水分高度饱和（湿度>60%）是极端对流、闪降暴雨的前兆。" : "Corresponds directly to VIX ranges. Saturated moisture signals brewing anxiety and structural swings."}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">💨 {isZh ? "席位换手风速 (Vol)" : "Trade Gale Wind"}:</span>
                    {isZh ? "表征30日换手成交额速率。极强换手大风可能由主力抛售或者利好狂热卷起的流动性信风组成。" : "Relative transactions trading volume metrics. Strong high-speed trade winds track heavy liquidation activity."}
                  </div>
                </div>
              </section>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              id="guide_close_btn"
            >
              {isZh ? "关闭气象驾驶舱分析指导" : "Close Met-Station Guidance"}
            </button>
          </div>
        </div>
      )}

      {/* Footer information bar */}
      <footer className="border-t border-slate-900 py-4 bg-slate-950 mt-auto" id="global_footer">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] font-mono text-slate-600">
          {isZh 
            ? "全球金融微气象模拟与气相会商系统 • 所有的空气湿度及卫星遥测气压读数均为动态数据模型测算结果" 
            : "GLOBAL FINANCIAL METEOROLOGICAL SERVICE OPERATING SYSTEM • ALL CLIMATE TRANSLATIONS ARE DYNAMIC MODEL SIMULATIONS"}
        </div>
      </footer>
    </div>
  );
}

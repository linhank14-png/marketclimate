import { MarketWeather, WeatherCondition } from "../types";

export function get5TradingDayLabels(forceDate?: Date): string[] {
  const date = forceDate || new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out: string[] = [];
  let current = new Date(date);
  
  while (out.length < 5) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
      out.push(weekdays[day]);
    }
    current.setDate(current.getDate() + 1);
  }
  return out;
}

export function generateUniqueAlert(market: MarketWeather) {
  const code = market.code.toUpperCase();
  const change = market.indexChange;
  const isUp = change >= 0;
  
  const alerts: Record<string, {
    clear_skies: { en: string; zht: string; zh: string };
    partly_cloudy: { en: string; zht: string; zh: string };
    cloudy: { en: string; zht: string; zh: string };
    rainy: { en: string; zht: string; zh: string };
    thunderstorms: { en: string; zht: string; zh: string };
  }> = {
    "US": {
      clear_skies: {
        en: "[NEWS FLASH: AI BOOM HEATWAVE] Wall Street tech indices soar as exceptional Nvidia quarterly earnings and AI datacenter capital expenditure trigger massive multi-gigawatt bullish pressure. NASDAQ reaches historic altitude, watch for high interest rate evaporation.",
        zht: "【即時財經：AI商機極高溫熱浪】華爾街科技股爆發！輝達（Nvidia）極致盈餘與各大雲端巨擘（Hyperscalers）大肆超支資本支出，引爆高強度多頭上升氣流。市場熱度達到歷史新高，須注意高利率滯留帶來的資金蒸發脫水風險。",
        zh: "【即时财经：AI商机极高温热浪】华尔街科技股爆发！辉达（Nvidia）极致盈余与各大云端巨头（Hyperscalers）大肆超支资本支出，引爆高强度多头上升气流。市场热度达到历史新高，须注意高利率滞留带来的资金蒸发脱水风险。"
      },
      partly_cloudy: {
        en: "[NEWS FLASH: FED RATE CUT OUTLOOK] Federal Reserve communications flag potential soft landing with moderate rate cut expectations, stabilizing trade wind vectors. US Treasury yields retreat lightly under thin cloud cover.",
        zht: "【即時財經：聯準會溫和降息預期】聯準會最新公報暗示經濟有望「軟著陸」，溫和的降息預期為市場吹來穩定西風微風。美債殖利率輕度下調，高估值雲層稀疏，大盤穩健前行。",
        zh: "【即时财经：联准会温和降息预期】联准会最新公报暗示经济有望“软着陆”，温和的降息预期为市场吹来稳定西风微风。美债收益率轻度下调，高估值云层稀疏，大盘稳健前行。"
      },
      cloudy: {
        en: "[NEWS FLASH: FLAT CPI OVERCAST] Latest US CPI/PCE inflation indicator prints line-in-the-sand figures. Wall Street remains locked in stagnant low visibility as traders debate the Fed's next decision move.",
        zht: "【即時財經：CPI通膨僵局濃霧】最新核心CPI與PCE數據與預期完全持平。華爾街資金流能見度下降，在聯準會下一步動向未明前，資金進入零風速的無方向多雲橫盤。",
        zh: "【即时财经：CPI通胀僵局浓雾】最新核心CPI与PCE数据与预期完全持平。华尔街资金流能见度下降，在联准会下一步动向未明前，资金进入零风速的无方向多云横盘。"
      },
      rainy: {
        en: "[NEWS FLASH: STICKY INFLATION DAMP CHILL] Surging labor employment and energy indexes raise sticky inflation concerns, threatening higher-for-longer Fed policy. Cloudburst of yields squeezes stock valuations.",
        zht: "【即時財經：通膨黏性冷雨】受勞動力就業市場及能源價格夾擊，核心通膨異常黏稠，「更長、更高」的利率預期帶來濕冷氣流。收益率曲線凝結降雨，重壓科技板塊估值。",
        zh: "【即时财经：通胀粘性冷雨】受劳动力就业市场及能源价格夹击，核心通胀异常粘稠，“更长、更高”的利率预期带来湿冷气流。收益率曲线凝结降雨，重压科技板块估值。"
      },
      thunderstorms: {
        en: "[NEWS FLASH: STEEP YIELD CURVE HURRICANE] Unexpected monetary tightening panic or systemic financial sector default risk sparks black swan storm, hitting tech giants with relentless liquidation storms and VIX lightning.",
        zht: "【即時財經：美債收益率倒掛信用暴風雨】宏觀流動性突發冰凍，伴隨高利率滯留引發的系統性信用違約風險！恐慌指數（VIX）閃電撕裂空域，科技股遭受無情斷頭融資暴風雨襲擊！",
        zh: "【即时财经：美债收益率倒挂信用暴风雨】宏观流动性突发冰冻，伴随高利率滞留引发的系统性信用违约风险！恐慌指数（VIX）闪电撕裂空域，科技股遭受无情断头融资暴风雨袭击！"
      }
    },
    "TW": {
      clear_skies: {
        en: "[NEWS FLASH: TSMC GLOBAL 2nm DOMINANCE] Taiwan Semiconductor (TSMC) reports surging high-performance computing chip output. Taipei semiconductor cluster generates massive capital thermal draft, taking TAIEX to record highs.",
        zht: "【即時財經：台積電先進製程超強颱風】台積電盤中公佈先進製程接單大爆發、全球擴廠產能暢旺！竹科與南科半導體供應鏈吹起史詩級多頭熱氣旋，加權指數突破極高壓晴空脊線。",
        zh: "【即时财经：台积电先进制程超强台风】台积电盘中公布先进制程接单大爆发、全球扩厂产能畅旺！竹科与南科半导体供应链吹起史诗级多头热气旋，加权指数突破极高压晴空脊线。"
      },
      partly_cloudy: {
        en: "[NEWS FLASH: AI SERVER SUPPLY EXPORTS] Solid export order growth in Taiwan computing server assembly tracks. High thermal semiconductor waves keep skies clear and trading momentum pleasant.",
        zht: "【即時財經：AI伺服器與外銷熱洋流】外銷訂單統計顯示AI伺服器及通訊零組件出口暢旺。台北股海暖洋流持續輸送溫和動力，雲霧輕微散去，科技藍籌股能見度極佳。",
        zh: "【即时财经：AI服务器与外销热洋流】外销订单统计显示AI服务器及通讯零组件出口旺。台北股海暖洋流持续输送温和动力，云雾轻微散去，科技蓝筹股可见度极佳。"
      },
      cloudy: {
        en: "[NEWS FLASH: TRADITIONAL COMPONENT OVERCAST] Stagnant orders in traditional manufacturing and petrochemical sectors trigger low dynamic drift, counterbalancing Taiwan IT cluster.",
        zht: "【即時財經：傳產塑化板塊黏稠層雲】傳統塑化、鋼鐵重工業需求低迷，與電子業高溫形成兩極對流。市場資金風速歸於平靜，大盤受阻於半年線，呈現平淡陰沉格局。",
        zh: "【即时财经：传产塑化板块粘性层云】传统塑化、钢铁重工业需求低迷，与电子业高温形成两极对流。市场资金风速归于平静，大盘受阻于半年线，呈现平淡阴沉格局。"
      },
      rainy: {
        en: "[NEWS FLASH: FOREIGN INSTITUTIONAL WITHDRAWAL] Rapid foreign institutional capital reallocation dumps cool moisture over TAIEX heavyweight stocks. Heavy localized liquid selling causes wet slipping.",
        zht: "【即時財經：外資大舉調節提款冷雨】外資法人基於地緣政治與全球資產配置考量急撤資金，對台股權值股形成冷雨重壓。地面濕滑，指數面臨破線考驗，進入局部的流動性降雨。",
        zh: "【即时财经：外资大举調節提款冷雨】外资法人基于地缘政治与全球资产配置考量急撤资金，对台股权值股形成冷雨重压。地面湿滑，指数面临破线考验，进入局部的流动性降雨。"
      },
      thunderstorms: {
        en: "[NEWS FLASH: GEOPOLITICAL STRAIT GALE] Deep structural geopolitical escalation couples with domestic power grid disruptions, triggering cascading panic halts and systemic semiconductor supply chain flash freezes.",
        zht: "【即時財經：地緣政治與電網安全紅色雷暴】台海地緣政經壓力與本土電力供應系統脆弱性共振，全球科技供應鏈驚傳中斷雷擊！融資大規模斷頭雷暴狂瀉，台北大盤陷入極限跌幅洪澇！",
        zh: "【即时财经：地缘政治与电网安全红色雷暴】台海地缘政经压力与本土电力供应系统安全性共振，全球科技供应链惊传中断雷击！融资大规模断头雷暴狂泻，台北大盘陷入极限跌幅洪涝！"
      }
    },
    "JP": {
      clear_skies: {
        en: "[NEWS FLASH: BOE/TSE CORPORATE UPGRADES] Tokyo Stock Exchange active pressure on corporate value upgrades combined with retail NISA account inflows generate long-awaited stock gains. Nikkei breaches all-time peak with sunny sentiment.",
        zht: "【即時財經：大和去負利率金融熱浪】東京證交所（TSE）治理改革逼迫上市公司提高資本效率，加上新版 NISA 儲蓄帳戶引導大量家庭游資回流！日本股市歷史高空融雪，日經攀展晴空峰頂。",
        zh: "【即时财经：大和去负利率金融热浪】东京证交所（TSE）治理改革逼迫上市公司提高资本效率，加上新版 NISA 储蓄账户引导大量家庭游资回流！日本股市历史高空融雪，日经攀展晴空峰顶。"
      },
      partly_cloudy: {
        en: "[NEWS FLASH: WEAK YEN EXPORTER WIND] Weak Yen dynamics continue to feed record trade winds to large exporters like Toyota. Tokyo atmosphere remains comfortable and sunny.",
        zht: "【即時財經：弱勢日圓出口順風】日圓相對低位維持歷史低點，極度推高豐田等出口汽車巨擘獲利潛力。高空微風徐徐，出口商外銷利基溫和，日照舒適好客。",
        zh: "【即时财经：弱势日圆出口顺风】日元相对低位维持历史低点，极度推高丰田等出口汽车巨头获利潜力。高空微风徐徐，出口商外销利基温和，日照舒适好客。"
      },
      cloudy: {
        en: "[NEWS FLASH: BOJ HAWK SIGNAL MIST] Bank of Japan hints at interest rate hike path, throwing a quiet mist over Tokyo finance houses. Visibility remains stable under thin clouds.",
        zht: "【即時財經：日銀升息路徑政策迷霧】日本央行官員重申貨幣正常化方向、暗示將穩健降準加息，引發短線資金觀望、利率對流。大氣懸浮粒子滯留，兜町金融區交易陷入平靜低風能見度。",
        zh: "【即时财经：日银升息路径政策迷雾】日本央行官员重申货币正常化方向、暗示将稳健降准加息，引发短线资金观望、利率对流。大气悬浮粒子滞留，兜町金融区交易陷入平静低风能见度。"
      },
      rainy: {
        en: "[NEWS FLASH: REAL WAGE CONTRACTION DRIZZLE] Persistent declines in Japanese real wages depress domestic consumer spending, spraying flat retail drizzle down commercial charts.",
        zht: "【即時財經：實質薪資倒退內需冷細雨】最新春鬥薪資增幅追不上通膨，全國家計消費支出下滑，非出口零售板塊慘遭陰雨淋濕。空氣潮濕，資金避風轉移。",
        zh: "【即时财经：实质薪资倒退内需冷细雨】最新春斗薪资增幅追不上通胀，全国家计消费支出下滑，非出口零售板块惨遭阴雨淋湿。空气潮湿，资金避风转移。"
      },
      thunderstorms: {
        en: "[NEWS FLASH: YEN CARRY TRADE UNWIND GALE] Sudden rate hike from BoJ triggers rapid unwind of global yen carry trade arbitrage networks. Brutal financial lightning storm hits Nikkei heavyweights.",
        zht: "【即時財經：日圓利差平倉黑天鵝颶風】日本央行無預警大幅收緊貨幣，引發大規模利差交易平倉颶風，巨量離岸避險熱錢瘋狂出逃！融資慘遭落雷連環擊穿，日經大盤重挫入淹水區！",
        zh: "【即时财经：日记其平仓黑天鹅飓风】日本央行无预警大幅收紧货币，引发大规模利差交易平仓飓风，巨量离岸避险热钱疯狂出逃！融资惨遭落雷连环击穿，日经大盘重挫入淹水区！"
      }
    },
    "KR": {
      clear_skies: {
        en: "DRAM SOLAR FLARE: High bandwidth memory chip exports triggers supercharged solar winds, heating KOSPI to historic summer level.",
        zht: "【南韓HBM記憶體烈日高照】高頻寬記憶體與AI晶片外銷爆發強烈太陽耀斑！大散戶與財閥大氣買氣升騰，大盤溫度急升至酷署溫標。",
        zh: "【南韩HBM记忆体烈日高照】高频宽记忆体与AI芯片爆发强烈太阳耀斑！大散户与财阀大气买气升腾，大盘温度急升至酷署温标。"
      },
      partly_cloudy: {
        en: "SEOUL TECH GALE: Electric memory currents providing sunny windows. Export metrics remain stable over Incheon trade routes.",
        zht: "【首爾科技溫和光照】半導體外銷回暖，為汝矣島上空驅散部分雨雲。記憶體出口穩定，多頭氣溫緩步抬升。",
        zh: "【首尔科技温和光照】半导体外销回暖，为汝矣岛上空驱散部分烟云。记忆体出口稳定，多头气温缓步抬升。"
      },
      cloudy: {
        en: "COSMETIC FLAT STRATUS: Neutral retail trade and stagnant export volumes creating a vast gray canopy over Korean indices.",
        zht: "【中韓貿易滯留層雲】出口貿易面臨輕度對流停滯，美妝與傳統重工業大盤水份粘稠，大氣壓力處於均衡盤整階段。",
        zh: "【中韩贸易滞留层云】出口贸易面临轻度对流停滞，美妆与传统重工业大盘水分粘稠，大气压力处于均衡盘整阶段。"
      },
      rainy: {
        en: "WON DEVALUATION DROP: Weak South Korean currency triggering heavy moisture droplets and asset slipping.",
        zht: "【韓元疲軟暴雨冷鋒】韓元無預警走弱導致國際資本急撤，大盤空域大降雨連連，權值科技巨頭均遭受雨水淋縮。",
        zh: "【韩元疲软暴雨冷锋】韩元无预警走弱导致国际资本急撤，大盘空域大降雨连连，权值科技巨头均遭受雨水淋缩。"
      },
      thunderstorms: {
        en: "SEMICONDUCTOR POLAR VORTEX: Critical cyclical tech downturn causing rapid ice-storm and liquidation lightning across Samsung and SK Hynix.",
        zht: "【三星半導體大電網斷電】國際記憶體巨頭突遇暴雪夾擊，遭遇大規模產產產產產產線冰凍風暴，多頭恐慌拋售雷擊如雨點般砸碎防波堤！",
        zh: "【三星半导体大电网断电】国际记忆体巨头突遇暴雪夹击，遭遇大规模产线冰冻风暴，多头恐慌抛售雷击如雨点般砸碎防波堤！"
      }
    },
    "GB": {
      clear_skies: {
        en: "STERLING SOLAR CREST: Multi-year low inflation and strong sterling yields driving FTSE to exceptional sunny clear heights.",
        zht: "【英倫匯率晴空高壓】通膨滑落自多年低點，英鎊匯率優勢極度推升FTSE出口商利基。多頭氣流穩定，氣候溫和宜人。",
        zh: "【英伦汇率晴空高压】通胀滑落自多年低点，英镑汇率优势极度推升FTSE出口商利基。多头气流稳定，气候温和宜人。"
      },
      partly_cloudy: {
        en: "THAMES PLEASANT CLOUD: Moderate composite service expansion provides a comfortable atmosphere for London trading accounts.",
        zht: "【泰晤士河溫馨半晴】綜合服務業溫和擴張，為倫敦交易所空域撐開宜人的部分晴空。大盤平順。 ",
        zh: "【泰晤士河温馨半晴】综合服务业温和扩张，为伦敦交易所空域撑开宜人的部分晴空。大盘平顺。"
      },
      cloudy: {
        en: "BRITISH PERPETUAL MIST: Heavy local housing dampness keeping trade winds inside flat parameters. Low dynamic drift.",
        zht: "【大不列顛永恆濃霧】本土住宅物業增長停滯，金融市區被一片白茫茫的防禦濃霧鎖定。風速微弱，多頭大盤原地整理。",
        zh: "【大不列逼恒浓雾】本土住宅物业增长停滞，金融市区被一片白茫茫的防御浓雾锁定。风速微弱，多头大盘原地整理。"
      },
      rainy: {
        en: "NORTH SEA DAMP CHILL: Stagnant GDP drizzle spraying banking sectors. Cold westerlies squeezing cash moisture.",
        zht: "【北海濕冷連綿細雨】GDP增長步履蹣跚，化作濕冷小雨不斷洗刷銀行與地產。大盤溫度降低，能見度減弱。",
        zh: "【北海湿冷连绵细雨】GDP增长步履蹒跚，化作湿冷小雨不断洗刷银行与地产。大盘温度降低，能见度减弱。"
      },
      thunderstorms: {
        en: "STERLING LIQUIDITY ECLIPSE: Sovereign debt confidence thunderclap with sudden sterling liquidation currents wiping out banking grids.",
        zht: "【英鎊債務信用崩塌強雷暴】主權債信用暴雷！外匯市場刮起英鎊拋售狂風，連環平倉落雷直接擊穿倫敦金融城配電網！",
        zh: "【英镑债务信用崩塌强雷暴】主权债信用暴雷！外汇市场刮起英镑抛售狂风，连环平仓落雷直接击穿伦敦金融城配电网！"
      }
    }
  };

  const cAlert = alerts[code];
  if (cAlert) {
    const active = cAlert[market.condition];
    if (active) {
      market.alert = active.en;
      market.alertZh = active.zh;
      market.alertZht = active.zht;
      return;
    }
  }

  const isUptextZht = isUp ? "多頭暖溫高壓" : "空頭低冷雨鋒";
  market.alert = `PECULIAR REGIONAL METEOROLOGY ALERT [${market.country}]: High dynamic ${isUp ? "BULLISH PRESSURE" : "BEARISH OUTFLOW"} detected over ${market.indexName} at ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). Air-pressure reading: ${market.pressure} hPa, volatility humidity: ${market.humidity}%. Avoid over-exposure.`;
  market.alertZh = `【${market.country}金融異常通告】區域測量雷達監測到大盤指數 ${market.indexName} 出现独特【${isUptextZht}】！当前气压 ${market.pressure} hPa，交易波动湿度 ${market.humidity}%，风速 ${market.windSpeed} km/h。`;
  market.alertZht = `【${market.country}金融異常通告】區域測量雷達監測到大盤指數 ${market.indexName} 出現獨特【${isUptextZht}】！當前氣壓 ${market.pressure} hPa，交易波動濕度 ${market.humidity}%，風速 ${market.windSpeed} km/h。`;
}

export function dynamicallyUpdateThematicData(market: MarketWeather) {
  const baseTemps: Record<string, number> = {
    "United States": 29, "Japan": 19, "India": 32, "Germany": 15, "United Kingdom": 13,
    "France": 17, "China": 9, "Australia": 17, "Brazil": 10, "Canada": 16, "Taiwan": 24,
    "South Korea": 18, "Singapore": 16, "Saudi Arabia": 28, "Malaysia": 25, "Indonesia": 26, "Thailand": 27
  };
  const baseT = baseTemps[market.country] ?? 20;
  market.temperature = Math.max(-5, Math.min(45, Math.round(baseT + market.indexChange * 1.5)));
  market.pressure = Math.round(1013.25 + (market.indexChange * 4.5));
  market.humidity = Math.max(10, Math.min(95, Math.round(35 - market.indexChange * 11)));
  market.windSpeed = Math.max(5, Math.min(90, Math.round(18 + Math.abs(market.indexChange) * 12)));

  const days = get5TradingDayLabels();
  market.outlook5Day = days.map((day, ix) => {
    const wave = Math.sin(ix * 0.9);
    const dailyChange = parseFloat((market.indexChange * 0.7 + wave * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(2));
    
    let cond: 'clear_skies' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorms' = 'cloudy';
    if (dailyChange >= 3.0) cond = 'clear_skies';
    else if (dailyChange >= 1.0) cond = 'partly_cloudy';
    else if (dailyChange >= -1.0) cond = 'cloudy';
    else if (dailyChange >= -3.0) cond = 'rainy';
    else cond = 'thunderstorms';

    const temp = Math.max(-5, Math.min(45, Math.round(baseT + dailyChange * 1.5)));
    return { day, condition: cond, temp, change: dailyChange };
  });

  generateUniqueAlert(market);

  const country = market.country;
  if (country === "United States") {
    market.summary = `Radiant high-pressure bull market with S&P 500 at ${market.indexValue} (gaining +${market.indexChange}%). Capital inflows whistle optimism wind currents.`;
    market.summaryZht = `穩健的高氣壓牛市，標普500指數高歌來到 ${market.indexValue} (今日大漲 +${market.indexChange}%)。活躍的資金流入為美股煽起熱烈和風。`;
    market.summaryZh = `稳健的高气压牛市，标普500指数高歌来到 ${market.indexValue} (今日大涨 +${market.indexChange}%)。活跃的资金流入为美股煽起热烈和风。`;

    market.economicAnalysis = `Robust labor markets and rising GDP support corporate temperatures at ${market.temperature}°C. Index change is +${market.indexChange}%, showing stable atmospheric ridges.`;
    market.economicAnalysisZht = `今日標普大盤交出 +${market.indexChange}% 成績，強大就業數據烘託估值暖氣團。儘管核心通膨粘性仍在，降息暖流預期依然引發科技盤全面買盤。`;
    market.economicAnalysisZh = `今日标普大盘交出 +${market.indexChange}% 成绩，强大就业数据烘托估值暖气团。尽管核心通胀粘性仍在，降息暖流预期依然引发科技盘全面买盘。`;
  }
  else if (country === "Japan") {
    market.summary = `Nikkei 225 fluctuating near ${market.indexValue} (today changing ${market.indexChange}%). Corporate reforms yield golden sun patches.`;
    market.summaryZht = `日經225指數在 ${market.indexValue} 收盤 (今日變動 ${market.indexChange}%)。穩健的企業治理升級正為本土大盤投下一片溫暖的日照。`;
    market.summaryZh = `日经225指数在 ${market.indexValue} 收盤 (今日变动 ${market.indexChange}%)。稳健的企业治理升级正为本土大盘投下一片温暖的照耀。`;

    market.economicAnalysis = `Bank of Japan expands accommodative settings. Index valuation pressure reads ${market.pressure} hPa, offsetting international headwinds.`;
    market.economicAnalysisZht = `日本央行退出負利率後維持政策寬鬆調性，今日指數收在 ${market.indexValue} ( ${market.indexChange}% )。公司經營改革吸納境外長線資金，抵禦了進口空海運通漲壓力。`;
    market.economicAnalysisZh = `日本央行退出负利率后维持政策宽松调性，今日指数收在 ${market.indexValue} ( ${market.indexChange}% )。公司经营改革吸纳境外长线资金，抵御了进口空海运通涨压力。`;
  }
  else if (country === "India") {
    market.summary = `Scorching cloudless sunshine for SenseX hovering at ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). Retail capital continues to whip up massive buying updrafts.`;
    market.summaryZht = `印度大盤上空陽光熾熱，加權指數收於 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。極熱內需激發散戶與機構買氣源源不斷。`;
    market.summaryZh = `印度大盘上空阳光灼热，加权指数收于 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。极热内需激发散户与机构买气源源不断。`;

    market.economicAnalysis = `Sensational 8.2% GDP expansion supports long term wind speeds of ${market.windSpeed} km/h. Trading volumes remain extremely dynamic despite Fed interest rate cloud covers.`;
    market.economicAnalysisZht = `印度第三季錄得極其強勁的8.2%經濟增幅，投資熱度狂飆。雖然美聯儲政策風向未明，但超旺本土買氣成功護送指數上揚 ${market.indexChange}% 至 ${market.indexValue}。`;
    market.economicAnalysisZh = `印度第三季录得极其强劲的8.2%经济增幅，投资热度狂飙。虽然美联储政策风向未明，但超旺本土买气成功护送指数上扬 ${market.indexChange}% 至 ${market.indexValue}。`;
  }
  else if (country === "Taiwan") {
    market.summary = `High tech silicon export currents blowing heavily across TAIEX at ${market.indexValue} (today ${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). Dynamic up-trending hardware patterns visible.`;
    market.summaryZht = `AI晶片科技熱帶風暴過境，台股加權指數收於 ${market.indexValue} 點 ( ${market.indexChange >= 0 ? "+" : ""}${market.indexChange}% )。晶圓高額外銷暢旺，多頭氣壓強烈。`;
    market.summaryZh = `AI芯片科技热带风暴过境，台股加权指数收于 ${market.indexValue} 点 ( ${market.indexChange >= 0 ? "+" : ""}${market.indexChange}% )。晶圆高额外销畅旺，多头气压强烈。`;

    market.economicAnalysis = `High performance computing hardware demand provides solid support at ${market.pressure} hPa. Advanced semiconductors export pipelines keep the technology trade clouds warm.`;
    market.economicAnalysisZht = `全球AI伺服器與高效晶片封裝需求急速引爆，今日推升台股大盤變動達 ${market.indexChange}%。本國外銷動能充沛，推動半導體多頭氣壓計保持在優越的 ${market.pressure} hPa 高位。`;
    market.economicAnalysisZh = `全球AI服务器与高效芯片封装需求急剧引爆，今日推升台股大盘变动达 ${market.indexChange}%。本国外销动能充沛，推动半导体多头气压计保持在优越的 ${market.pressure} hPa 高位。`;
  }
  else if (country === "China") {
    market.summary = `Shanghai Composite hovering at ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). Heavy property sectors restructuring clouds keep humidity damp.`;
    market.summaryZht = `上證指數收於 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。房產去槓桿重整與大宗商品軟盤整理使得空域大氣濕潤。`;
    market.summaryZh = `上证指数收于 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。房产去杠杆重整与大宗商品软盘整理使得空域大气湿润。`;

    market.economicAnalysis = `Deflationary pressures are offset slightly by national state capital injections. Investors navigate shifting wind currents toward high income dividend holdings.`;
    market.economicAnalysisZht = `今日中國股市變動為 ${market.indexChange}%。雖然房企調整與商品市場面臨偏乾冷空氣，但政府連續投放融雪注水，多頭轉向抱團高股息防禦大傘，保持一定能見度。`;
    market.economicAnalysisZh = `今日中国股市变动为 ${market.indexChange}%。虽然房企调整与商品市场面临偏干冷空气，但政府连续投放融雪注水，多头转向抱团高股息防御大伞，保持一定可见度。`;
  }
  else if (country === "South Korea") {
    market.summary = `KOSPI index consolidates around ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). DRAM and tech cargo ships are cutting through global maritime breezes.`;
    market.summaryZht = `南韓綜合指數於 ${market.indexValue} 處低空盤旋 (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。高頻寬晶片外銷暖流正與外部冷氣流激烈對沖。`;
    market.summaryZh = `南韩综合指数于 ${market.indexValue} 处低空盘旋 (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。高频宽芯片外销暖流正与外部冷气流激烈冲。`;

    market.economicAnalysis = `Cyclical semiconductor trade updates support Korean corporate temperatures at ${market.temperature}°C. The domestic monetary landscape remains highly active close to standard sea-levels.`;
    market.economicAnalysisZht = `高科技電子產品及記憶體巨頭外銷動能平穩，指數量值受到出口數據有力承托。儘管韓元匯率有所波動，整體在 ${market.pressure} hPa 基本氣壓帶上保持橫向巡航。`;
    market.economicAnalysisZh = `高科技电子产品及记忆体巨头外销动能平稳，指数量值受到出口数据有力承托。尽管韩元汇率有所波动，整体在 ${market.pressure} hPa 基本气压带上保持横向巡航。`;
  }
  else if (country === "Singapore") {
    market.summary = `Straits Times Index remains steady at ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). Defensive capital continues to harbor inside Singapore's financial shield.`;
    market.summaryZht = `新加坡海峽時報指數收盤平穩於 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。國際信託與REITs資產為空域帶來強大防禦屏障。`;
    market.summaryZh = `新加坡海峡时报指数收盘平稳于 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。国际信托与REITs资产为空域带来强大防御屏障。`;

    market.economicAnalysis = `ASEAN's capital flows keep regional liquidity levels steady with a safe humidity reading of ${market.humidity}%. No immediate wind disturbances expected on Malaccan shipping routes.`;
    market.economicAnalysisZht = `作為東協金融與資產避風港，當前新加坡大氣極為乾燥安全，能見度優越。今日大盤收跌微變 ${market.indexChange}%，各主權基金與財富中心空域安全晴朗。`;
    market.economicAnalysisZh = `作为东协金融与资产避险港，当前新加坡大气极为干燥安全，能见度优越。今日大盘收跌微变 ${market.indexChange}%，各主权基金与财富中心空域安全晴朗。`;
  }
  else if (country === "Saudi Arabia") {
    market.summary = `Desert black-gold heat sweeping through Tadawul All Share Index (TASI) at ${market.indexValue} (+${market.indexChange}%). Petroleum heat gradients are strong.`;
    market.summaryZht = `沙烏地原油加權熱能發放，TASI指數收在 ${market.indexValue} (+${market.indexChange}%)。強大石油美元氣流席捲整個利雅德。`;
    market.summaryZh = `沙乌地原油加权热能发放，TASI指数收在 ${market.indexValue} (+${market.indexChange}%)。强大石油美元气流席卷整个利雅德。`;

    market.economicAnalysis = `High crude-oil barometric pressure reads ${market.pressure} hPa, keeping Riyadh's economic wind speed dynamically warm at ${market.windSpeed} km/h.`;
    market.economicAnalysisZht = `原油輸出與石化工業氣氛依然熾熱，今日推動中東大盤大幅上揚 ${market.indexChange}%。本土非油產業（願景2030）熱風持續輸送，護航估值大盤氣壓達到極佳的 ${market.pressure} hPa。`;
    market.economicAnalysisZh = `原油输出与石化工业气氛依然炽热，今日推动中东大盘大幅上扬 ${market.indexChange}%。本土非油产业（愿景2030）热风持续输送，护航估值大盘气压达到极佳的 ${market.pressure} hPa。`;
  }
  else {
    const statusSign = market.indexChange >= 0 ? "positive macro heat pressure" : "cooling macro air pressure";
    const statusSignZh = market.indexChange >= 0 ? "暖高氣壓空氣" : "冷氣壓冷流陰雨";

    market.summary = `Dynamic monitoring captures ${market.indexName} at ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). System metrics report ${statusSign}.`;
    market.summaryZht = `金融雷達掃描到【${market.indexName}】收載於 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。正迎來一波活躍的【${statusSignZh}】。`;
    market.summaryZh = `金融雷达扫描到【${market.indexName}】收载于 ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。正迎来一波活跃的【${statusSignZh}】。`;

    market.economicAnalysis = `Barometric parameters for ${market.country} show index valuation humidity at ${market.humidity}% with an index value of ${market.indexValue}. Average trading wind speed is ${market.windSpeed} km/h.`;
    market.economicAnalysisZht = `多空多源測評顯示，${market.country}當前金融空域估值大盤溫度 ${market.temperature}°C，氣壓為 ${market.pressure} hPa。今日股價變幅為 ${market.indexChange}%，伴隨交易風速 ${market.windSpeed} km/h。`;
    market.economicAnalysisZh = `多空多源测评显示，${market.country}当前金融空域估值大盘温度 ${market.temperature}°C，气压为 ${market.pressure} hPa。今日股价变幅为 ${market.indexChange}%，伴随交易风速 ${market.windSpeed} km/h。`;
  }
}

export const INITIAL_OFFLINE_MARKETS: MarketWeather[] = [
  {
    country: "United States",
    code: "US",
    indexName: "S&P 500",
    indexValue: 7445.72,
    indexChange: 0.17,
    condition: "cloudy",
    temperature: 29,
    pressure: 1014,
    humidity: 34,
    windSpeed: 20,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Japan",
    code: "JP",
    indexName: "Nikkei 225",
    indexValue: 63094.61,
    indexChange: 2.29,
    condition: "partly_cloudy",
    temperature: 22,
    pressure: 1024,
    humidity: 11,
    windSpeed: 44,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "India",
    code: "IN",
    indexName: "BSE SENSEX",
    indexValue: 75183.36,
    indexChange: -0.18,
    condition: "cloudy",
    temperature: 32,
    pressure: 1012,
    humidity: 36,
    windSpeed: 20,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Germany",
    code: "DE",
    indexName: "DAX 40",
    indexValue: 24606.77,
    indexChange: -0.53,
    condition: "cloudy",
    temperature: 14,
    pressure: 1011,
    humidity: 39,
    windSpeed: 23,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "United Kingdom",
    code: "GB",
    indexName: "FTSE 100",
    indexValue: 10443.47,
    indexChange: 0.11,
    condition: "cloudy",
    temperature: 13,
    pressure: 1014,
    humidity: 35,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "France",
    code: "FR",
    indexName: "CAC 40",
    indexValue: 8086.00,
    indexChange: -0.39,
    condition: "cloudy",
    temperature: 16,
    pressure: 1011,
    humidity: 37,
    windSpeed: 22,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "China",
    code: "CN",
    indexName: "Shanghai Composite",
    indexValue: 4082.91,
    indexChange: 0.14,
    condition: "cloudy",
    temperature: 9,
    pressure: 1014,
    humidity: 32,
    windSpeed: 20,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Australia",
    code: "AU",
    indexName: "ASX 200",
    indexValue: 8670.70,
    indexChange: 0.57,
    condition: "cloudy",
    temperature: 18,
    pressure: 1016,
    humidity: 29,
    windSpeed: 25,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Brazil",
    code: "BR",
    indexName: "IBOVESPA",
    indexValue: 177649.86,
    indexChange: 0.17,
    condition: "cloudy",
    temperature: 10,
    pressure: 1014,
    humidity: 31,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Canada",
    code: "CA",
    indexName: "S&P/TSX Composite",
    indexValue: 34409.49,
    indexChange: 0.72,
    condition: "cloudy",
    temperature: 17,
    pressure: 1016,
    humidity: 25,
    windSpeed: 27,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Taiwan",
    code: "TW",
    indexName: "TAIEX",
    indexValue: 42001.66,
    indexChange: 1.53,
    condition: "partly_cloudy",
    temperature: 26,
    pressure: 1020,
    humidity: 18,
    windSpeed: 36,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "South Korea",
    code: "KR",
    indexName: "KOSPI",
    indexValue: 7829.87,
    indexChange: 0.18,
    condition: "cloudy",
    temperature: 18,
    pressure: 1014,
    humidity: 31,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Singapore",
    code: "SG",
    indexName: "Straits Times Index (STI)",
    indexValue: 5053.86,
    indexChange: 0.16,
    condition: "cloudy",
    temperature: 16,
    pressure: 1014,
    humidity: 34,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Saudi Arabia",
    code: "SA",
    indexName: "Tadawul All Share Index (TASI)",
    indexValue: 11027.54,
    indexChange: 0.38,
    condition: "cloudy",
    temperature: 29,
    pressure: 1015,
    humidity: 30,
    windSpeed: 23,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Malaysia",
    code: "MY",
    indexName: "FTSE Bursa Malaysia KLCI",
    indexValue: 1713.02,
    indexChange: 0.27,
    condition: "cloudy",
    temperature: 25,
    pressure: 1014,
    humidity: 30,
    windSpeed: 20,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Indonesia",
    code: "ID",
    indexName: "IDX Composite",
    indexValue: 6041.93,
    indexChange: -0.87,
    condition: "cloudy",
    temperature: 25,
    pressure: 1009,
    humidity: 43,
    windSpeed: 28,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Thailand",
    code: "TH",
    indexName: "SET Index",
    indexValue: 1532.67,
    indexChange: 0.28,
    condition: "cloudy",
    temperature: 27,
    pressure: 1015,
    humidity: 32,
    windSpeed: 21,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Mexico",
    code: "MX",
    indexName: "S&P/BMV IPC",
    indexValue: 56120.30,
    indexChange: 0.15,
    condition: "partly_cloudy",
    temperature: 21,
    pressure: 1013,
    humidity: 35,
    windSpeed: 18,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Argentina",
    code: "AR",
    indexName: "S&P Merval",
    indexValue: 1240250.00,
    indexChange: 1.45,
    condition: "clear_skies",
    temperature: 14,
    pressure: 1022,
    humidity: 16,
    windSpeed: 35,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Chile",
    code: "CL",
    indexName: "IPSA Chile",
    indexValue: 6512.40,
    indexChange: 0.22,
    condition: "partly_cloudy",
    temperature: 16,
    pressure: 1014,
    humidity: 26,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Colombia",
    code: "CO",
    indexName: "COLCAP",
    indexValue: 1395.10,
    indexChange: -0.12,
    condition: "cloudy",
    temperature: 22,
    pressure: 1010,
    humidity: 42,
    windSpeed: 18,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Peru",
    code: "PE",
    indexName: "S&P/BVL General",
    indexValue: 28410.20,
    indexChange: 0.35,
    condition: "partly_cloudy",
    temperature: 18,
    pressure: 1014,
    humidity: 38,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Switzerland",
    code: "CH",
    indexName: "SMI",
    indexValue: 11840.20,
    indexChange: 0.45,
    condition: "partly_cloudy",
    temperature: 12,
    pressure: 1015,
    humidity: 21,
    windSpeed: 21,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Italy",
    code: "IT",
    indexName: "FTSE MIB",
    indexValue: 34120.10,
    indexChange: 0.75,
    condition: "partly_cloudy",
    temperature: 19,
    pressure: 1016,
    humidity: 28,
    windSpeed: 24,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Spain",
    code: "ES",
    indexName: "IBEX 35",
    indexValue: 11210.30,
    indexChange: 0.85,
    condition: "partly_cloudy",
    temperature: 20,
    pressure: 1018,
    humidity: 32,
    windSpeed: 34,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Netherlands",
    code: "NL",
    indexName: "AEX",
    indexValue: 915.20,
    indexChange: 0.52,
    condition: "partly_cloudy",
    temperature: 14,
    pressure: 1014,
    humidity: 38,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Belgium",
    code: "BE",
    indexName: "BEL 20",
    indexValue: 3912.40,
    indexChange: 0.15,
    condition: "partly_cloudy",
    temperature: 14,
    pressure: 1014,
    humidity: 42,
    windSpeed: 16,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Sweden",
    code: "SE",
    indexName: "OMX Stockholm 30",
    indexValue: 2612.30,
    indexChange: 0.35,
    condition: "partly_cloudy",
    temperature: 11,
    pressure: 1014,
    humidity: 38,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Russia",
    code: "RU",
    indexName: "MOEX Russia Index",
    indexValue: 3120.50,
    indexChange: -1.25,
    condition: "rainy",
    temperature: 6,
    pressure: 1004,
    humidity: 58,
    windSpeed: 23,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Turkey",
    code: "TR",
    indexName: "BIST 100",
    indexValue: 10240.50,
    indexChange: 1.85,
    condition: "clear_skies",
    temperature: 17,
    pressure: 1024,
    humidity: 14,
    windSpeed: 38,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "South Africa",
    code: "ZA",
    indexName: "JSE Top 40",
    indexValue: 71490.60,
    indexChange: 0.42,
    condition: "partly_cloudy",
    temperature: 18,
    pressure: 1014,
    humidity: 38,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Egypt",
    code: "EG",
    indexName: "EGX 30",
    indexValue: 26140.20,
    indexChange: -0.85,
    condition: "cloudy",
    temperature: 26,
    pressure: 1011,
    humidity: 48,
    windSpeed: 12,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "United Arab Emirates",
    code: "AE",
    indexName: "DFM General Index",
    indexValue: 4120.50,
    indexChange: 0.25,
    condition: "partly_cloudy",
    temperature: 30,
    pressure: 1015,
    humidity: 39,
    windSpeed: 15,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Poland",
    code: "PL",
    indexName: "WIG20",
    indexValue: 2410.20,
    indexChange: 0.65,
    condition: "partly_cloudy",
    temperature: 13,
    pressure: 1016,
    humidity: 28,
    windSpeed: 24,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Austria",
    code: "AT",
    indexName: "ATX",
    indexValue: 3612.40,
    indexChange: 0.05,
    condition: "cloudy",
    temperature: 13,
    pressure: 1010,
    humidity: 42,
    windSpeed: 18,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Hong Kong",
    code: "HK",
    indexName: "Hang Seng Index",
    indexValue: 18610.55,
    indexChange: -0.45,
    condition: "cloudy",
    temperature: 22,
    pressure: 1011,
    humidity: 48,
    windSpeed: 12,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Philippines",
    code: "PH",
    indexName: "PSEi",
    indexValue: 6610.20,
    indexChange: -0.15,
    condition: "cloudy",
    temperature: 28,
    pressure: 1011,
    humidity: 48,
    windSpeed: 12,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Vietnam",
    code: "VN",
    indexName: "VN-Index",
    indexValue: 1240.50,
    indexChange: 0.95,
    condition: "partly_cloudy",
    temperature: 27,
    pressure: 1015,
    humidity: 39,
    windSpeed: 15,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "New Zealand",
    code: "NZ",
    indexName: "NZX 50",
    indexValue: 11450.20,
    indexChange: 0.15,
    condition: "partly_cloudy",
    temperature: 14,
    pressure: 1014,
    humidity: 42,
    windSpeed: 16,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Pakistan",
    code: "PK",
    indexName: "KSE 100",
    indexValue: 75210.30,
    indexChange: 1.15,
    condition: "clear_skies",
    temperature: 29,
    pressure: 1024,
    humidity: 14,
    windSpeed: 38,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  }
];

// Initialize dynamic alerts/forecasts on offline dataset once
INITIAL_OFFLINE_MARKETS.forEach(m => dynamicallyUpdateThematicData(m));

export function generateMockForecast(country: string, isZh: boolean = false): MarketWeather {
  const norm = country.trim();
  const indexLookup: Record<string, { index: string; code: string; price: number; cond: string; zhCountry?: string; zhIndex?: string }> = {
    "switzerland": { index: "SMI", code: "CH", price: 11840.2, cond: "partly_cloudy", zhCountry: "瑞士", zhIndex: "瑞士SMI指數" },
    "south korea": { index: "KOSPI", code: "KR", price: 7829.87, cond: "cloudy", zhCountry: "南韓", zhIndex: "南韓綜合指數" },
    "taiwan": { index: "TAIEX", code: "TW", price: 42001.66, cond: "partly_cloudy", zhCountry: "台灣", zhIndex: "台灣加權指數" },
    "mexico": { index: "IPC", code: "MX", price: 56120.3, cond: "cloudy", zhCountry: "墨西哥", zhIndex: "墨西哥IPC指數" },
    "singapore": { index: "STI", code: "SG", price: 5053.86, cond: "cloudy", zhCountry: "新加坡", zhIndex: "新加坡海峽時報指數" },
    "russia": { index: "MOEX", code: "RU", price: 3120.5, cond: "thunderstorms", zhCountry: "俄羅斯", zhIndex: "俄羅斯MOEX指數" },
    "south africa": { index: "JSE Top 40", code: "ZA", price: 71490.6, cond: "cloudy", zhCountry: "南非", zhIndex: "南非JSE 40指數" },
    "italy": { index: "FTSE MIB", code: "IT", price: 34120.1, cond: "partly_cloudy", zhCountry: "義大利", zhIndex: "義大利MIB指數" },
    "vietnam": { index: "VN-Index", code: "VN", price: 1228.4, cond: "partly_cloudy", zhCountry: "越南", zhIndex: "越南VN指數" }
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

  const days = get5TradingDayLabels();
  const sampleOutlook = days.map((day, ix) => {
    const wave = Math.sin(ix * 0.9);
    const dailyChange = parseFloat((currentChange * 0.7 + wave * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(2));
    let cond: 'clear_skies' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorms' = 'cloudy';
    if (dailyChange >= 3.0) cond = 'clear_skies';
    else if (dailyChange >= 1.0) cond = 'partly_cloudy';
    else if (dailyChange >= -1.0) cond = 'cloudy';
    else if (dailyChange >= -3.0) cond = 'rainy';
    else cond = 'thunderstorms';
    const temp = Math.max(-5, Math.min(45, Math.round(tempMap[details.cond] + dailyChange * 1.5)));
    return { day, condition: cond, temp, change: dailyChange };
  });

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

  const outVal: MarketWeather = {
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
    outlook5Day: sampleOutlook
  };

  dynamicallyUpdateThematicData(outVal);
  return outVal;
}

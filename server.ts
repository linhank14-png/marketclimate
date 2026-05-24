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

function get5TradingDayLabels(forceDate?: Date): string[] {
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

function generateUniqueAlert(market: MarketWeather) {
  const code = market.code.toUpperCase();
  const change = market.indexChange;
  const isUp = change >= 0;
  
  // Custom alerts by country/code reflecting real world economic news
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
        zh: "【即时财经：AI服务器与外销热洋流】外销订单统计显示AI服务器及通讯零组件出口畅旺。台北股海暖洋流持续输送温和动力，云雾轻微散去，科技蓝筹股能见度极佳。"
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
        en: "BOJ ERUPTION HEATWAVE: Mega corporate reforms activating long-dormant yen geothermal hot springs. Foreign tourists funding massive thermal current.",
        zht: "【日銀火山噴發多頭熱浪】強烈公司治理改革引爆長期沉睡的經濟火山熱儲能！境外熱碼極速湧入，大盤攀越歷史最高峰頂。",
        zh: "【日银火山喷发多头热浪】强烈公司治理改革引爆长期沉睡的经济火山热储能！境外热码极速涌入，大盘攀越历史最高峰顶。"
      },
      partly_cloudy: {
        en: "YEN DEPRECIATION LIGHT BREEZE: Pleasant corporate governance upgrades scattering light clouds, offering sunshine to exporting industrial clusters.",
        zht: "【日圓貶值溫和微風】日圓輕度貶值為出口車企、電子業提供溫暖光照。空域部分多雲但日照亮麗，氣溫溫和回升。",
        zh: "【日元贬值温和微风】日元轻度贬值为出口车企、电子业提供温暖光照。空域部分多云但日照亮丽，气温温和回升。"
      },
      cloudy: {
        en: "INTEREST RATE CHILLY CLOUD: Markets awaiting next BOJ rate calibration, hanging flat mist over Kabuto-cho.",
        zht: "【日銀升息觀望愁雲】市場屏息靜待日本央行下一次利率基準標定，大氣高空陰霾滯留，金融市區風速近乎為零。",
        zh: "【日银升息观望愁云】市场屏息等待日本央行下一次利率基准标定，大气高空阴霾滞留，金融市区风速近乎为零。"
      },
      rainy: {
        en: "CONSUMPTION SHRINK DROP: Weak local worker spending spraying fine drizzle over Tokyo trading houses. Buying dampness is sticky.",
        zht: "【內需緊縮冷雨淋漓】本土實質薪資增長乏力化作綿密冷雨，零售消費板塊濕冷，迫使大盤向南漂移尋求避雨區。",
        zh: "【内需紧缩冷雨淋漓】本土实质薪资增长乏力化作绵密冷雨，零售消费板块湿冷，迫使大盘向南漂移寻求避雨区。"
      },
      thunderstorms: {
        en: "YOREI VOLCANIC ASH CRASH: Black Swan interest-rate explosion choking exporting turbines. Rapid panic storm freezing asset valuations.",
        zht: "【日銀暴力鷹派暴風雪】日銀無預警大幅收緊貨幣，引發大規模利差交易平倉颶風，巨量資產雪崩式垮塌，日經指數高空折翼！",
        zh: "【日银暴力鹰派暴风雪】日银无预警大幅收紧货币，引发大规模利差交易平仓飓风，巨量资产雪崩式垮塌，日经指数高空折翼！"
      }
    },
    "KR": {
      clear_skies: {
        en: "DRAM SOLAR FLARE: High bandwidth memory chip exports triggers supercharged solar winds, heating KOSPI to historic summer level.",
        zht: "【南韓HBM記憶體烈日高照】高頻寬記憶體與AI晶片外銷爆發強烈太陽耀斑！大散戶與財閥大氣買氣升騰，大盤溫度急升至酷暑溫標。",
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
        zht: "【三星半導體大電網斷電】國際記憶體巨頭突遇暴雪夾擊，遭遇大規模產線冰凍風暴，多頭恐慌拋售雷擊如雨點般砸碎防波堤！",
        zh: "【三星半导体大电网断电】国际记忆体巨头突遇暴雪夹击，遭遇大规模产线冰冻风暴，多头恐慌抛售雷击如雨点般砸碎防波堤！"
      }
    },
    "CN": {
      clear_skies: {
        en: "STATE-FUNDS SUN BLAST: Massive government liquidity snowplows heating Shanghai Composite to radiant high peaks.",
        zht: "【國家隊強力推土熱浪】主力資金在平原大規模融雪注水！滬深兩市高氣壓強烈，金融能見度直接照亮空頭陰霾。",
        zh: "【国家队强烈推土热浪】主力资金在平原大规模融雪注水！沪深两市高气压强烈，金融能见度直接照亮空头阴霾。"
      },
      partly_cloudy: {
        en: "LIQUIDITY SUNPATCHES: Minor central bank reserve cuts providing warm sunshine spots. Industrial factory breezes are slightly active.",
        zht: "【降準多頭溫和暖陽】央行微調降准，為金融大底輸送和煦陽光。製造業PMI氣流略見回升，局部藍籌股重獲光照。",
        zh: "【降准多头温和暖阳】央行微调降准，为金融大底输送和煦阳光。制造业PMI气流略见回升，局部蓝筹股重获光照。"
      },
      cloudy: {
        en: "MORTGAGE OVERCAST DRIFT: Real estate restructuring cloud cover keeping consumer air stagnant. Flat breeze with medium horizontal visibility.",
        zht: "【房地產重整黏稠層雲】房產去槓桿之雲層高空籠罩，大氣濕度黏稠，實體信用循環缺乏升溫風速，指數於海平線橫盤前進。",
        zh: "【房地产重整粘性层云】房产去杠杆之云层高空罩住，大气湿度粘稠，实体信用循环缺乏升温风速，指数于海平线横盘前进。"
      },
      rainy: {
        en: "DEFLATIONARY COLD DRIZZLE: Soft consumption index bringing wet mist. Heavy steel and property shares are taking on cold moisture.",
        zht: "【通縮乾冷空氣綿綿降雨】消費物價指數偏弱，乾冷空氣與南下資金碰撞降雨。地產以及傳統重工板塊面臨濕冷浸泡。",
        zh: "【通缩干冷空气绵密降雨】消费物价指数偏弱，干冷空气与南下资金碰撞降雨。地产以及传统重工板块面临湿冷浸泡。"
      },
      thunderstorms: {
        en: "DEBT DEFAULT SEVERE HURRICANE: Deep real-estate default lightning. Massive liquidation gales triggering nationwide financial flood alarms.",
        zht: "【地方房產債務巨爆特大暴雨】房產債務高空電網突發巨烈連環暴雷！信用雷暴夾擊江澤與華南板塊，引發空頭泄洪流，能見度降至極低！",
        zh: "【地方房产债务巨爆特大暴雨】房产债务高空电网突发巨烈连环暴风雷！信用雷暴夹击江泽与华南板块，引发空头泄洪流，能见度降至极低！"
      }
    },
    "SA": {
      clear_skies: {
        en: "DESERT BLACK-GOLD GEYSER: Desert sandstorm of historic crude-oil capital heating TASI over 12000 hPa level. Deep heatwave sweeps Riyadh.",
        zht: "【沙地黑金原油特大酷熱風暴】國際原油熱能爆發，推升利雅德大盤氣壓超越萬點大關！石油資本帶動極地沙塵高溫橫掃中東金融格線。",
        zh: "【沙地黑金原油特大酷热风暴】国际原油热能爆发，推升利雅得大盘气压超越万点大关！石油资本带动极地沙尘高温横扫中东金融格线。"
      },
      partly_cloudy: {
        en: "NATIVE VISION DRIFT: Saudi non-oil structural upgrades pushing light wind currents. High temperature energy remains stable.",
        zht: "【沙地願景願景溫和季風】非石油主業經濟轉型進展順利，為中東大空域驅散大部分煙霧。多頭氣溫穩定高溫，能見度良好。",
        zh: "【沙地愿景愿景温和季风】非石油主业经济转型进展顺利，为中东大空域驱散大部分烟云。多头气温稳定高温，能见度良好。"
      },
      cloudy: {
        en: "OPEC QUOTA FLAT OVERCAST: Production adjustment quotas freeze trading gusts. Crude markets resting horizontally with zero drift.",
        zht: "【OPEC減產配額平淡陰天】OPEC+原油產能調節決議擱置，市場風速歸零。石化重工業大盤頂著厚重雲層，橫盤觀望。",
        zh: "【OPEC减产配额平淡阴天】OPEC+原油产能调节决议搁置，市场风速归零。石化重工业大盘顶着厚重云层，横盘观望。"
      },
      rainy: {
        en: "CRUDE DEMAND WET WIND: Sagging global economic demand bringing slight crude price oil drizzle down Riyadh.",
        zht: "【原油需求走低濕冷逆風】全球工業原油庫存上升、需求走弱，導致利雅德基盤承受細雨洗刷，多頭氣溫稍微收縮。",
        zh: "【原油需求走低湿冷逆风】全球工业原油库存上升、需求走弱，导致利雅得基盘承受细雨洗刷，多头气温稍微收缩。"
      },
      thunderstorms: {
        en: "DESERT PETRO-CRASH ECLIPSE: Extreme geopolitical energy blackout and severe oil price price slide, freezing Middle East capital conduits.",
        zht: "【海灣戰爭陰霾極大震盪雷暴】中東地緣火藥庫引發災難性黑天鵝閃電！巨額資本瞬間抽離海灣市場，油氣輸送管線氣壓暴跌觸發全網禁運警戒！",
        zh: "【海湾战争阴霾极大震荡雷暴】中东地缘火药库引发灾难性黑天鹅闪电！巨额资本瞬间抽离海湾市场，油气输送管线气压暴跌触发全网禁运警戒！"
      }
    },
    "SG": {
      clear_skies: {
        en: "MERLION HARBOR LIQUIDITY FLOOD: Wealth allocation high-pressure wind currents pushing Straits Times Index on a cloudless buy surge.",
        zht: "【魚尾獅避險港資金極高壓】國際信託與境外財富大批降落，引發新加坡金融港灣資金嚴重氾濫！高大晴空，買氣暖流源源不斷。",
        zh: "【鱼尾狮避险港资金极高压】国际信托与境外财富大批降落，引发新加坡金融港湾资金严重泛滥！高大晴空，买气暖流源源不断。"
      },
      partly_cloudy: {
        en: "MALACCAN SHIFTING SUNNY PATTERNS: Quiet regional REITs trade winds. High-pressure ridges remain stable and secure.",
        zht: "【馬六甲平穩季風】東協貿易物流暢通，海峽時報大盤多雲見日。房地產信託（REITs）表現穩固，防禦屏障保護良好。",
        zh: "【马六甲平稳季风】东协贸易物流畅通，海峡时报大盘多云见日。房地产信托（REITs）表现稳固，防御屏障保护良好。"
      },
      cloudy: {
        en: "ASEAN SIDEWAYS MIST: Trade momentum resting inside narrow banking humidity curves. Low wind speed with gentle financial ripples.",
        zht: "【東協防禦觀望層雲】區域信貸與貿易對流平緩，金融港上空被黏稠的防禦觀望層雲鎖定，指數於海平線作微幅靜態波動。",
        zh: "【东协防御观望层云】区域信贷与贸易对流平缓，金融港上空被粘稠的防御观望层云锁定，指数于海平线作微幅静态波动。"
      },
      rainy: {
        en: "TRADE CONTEXT drizzle: Soft global ocean shipping metrics spraying slight precipitation over banking centers.",
        zht: "【全球航運衰退冷細雨】全球海運裝物吞吐指標下修，多重冷細雨吹襲航運與銀行板塊，海面能見度輕度受阻。",
        zh: "【全球航运衰退冷细雨】全球海运装物吞吐指标下修，多重冷细雨吹袭航运与银行板块，海面能见度轻度受阻。"
      },
      thunderstorms: {
        en: "MALACCAN CAPITAL TSUNAMI: Severe international banking liquidity freeze. Sudden flash tsunami storm wiping out high confidence harbor grids.",
        zht: "【南海金融超級海嘯特警】國際金融系統突發信用窒息海嘯！恐慌融資平倉巨浪沖垮海港防潮堤，本地金融基盤承壓陷入驚濤駭浪！",
        zh: "【南海金融超级海啸特警】国际金融系统企稳窒息海啸！恐慌融资平仓巨浪冲垮海港防潮堤，本地金融基盘承压陷入惊涛风浪！"
      }
    },
    "IN": {
      clear_skies: {
        en: "MONSOON LIQUIDITY SURFACING: Gushing domestic retail inflows creating high thermal convection. SENSEX soaring beyond dry dust clouds.",
        zht: "【印度季風資金噴發】本土散戶與內需資金形成強烈的垂直熱對流！孟買指數衝破旱季沙塵，大氣買氣熱浪滾滾。",
        zh: "【印度季风资金爆发】本土散户与内需资金形成强烈的垂直热对流！孟买指数冲破旱季沙尘，大气买气热浪滚滚。"
      },
      partly_cloudy: {
        en: "WARM TRADEWINDS: Moderate capital inflow with steady manufacturing humidity. Pleasant industrial breeze across Mumbai financial zones.",
        zht: "【孟買溫和貿易信風】溫和外資流入伴隨穩定的製造業PMI。孟買金融特區空域呈現和風麗日，多頭穩步前行。",
        zh: "【孟买温和贸易信风】温和外资流入伴随稳定的制造业PMI。孟买金融特区空域呈现和风丽日，多头稳步前行。"
      },
      cloudy: {
        en: "MUMBAI FOG STATE: Shifting central bank reserve discussions keeping trading volumes flat. Air pressure is neutral and sticky.",
        zht: "【印度央行利率平淡層雲】儲備銀行利率指引進入中性區間，市場風速冷靜，交易阻力適中，大盤呈現無風橫盤。",
        zh: "【印度央行利率平淡层云】储备银行利率指引进入中性区间，市场风速冷静，交易阻力心中，大盘呈现无风横盘。"
      },
      rainy: {
        en: "INFLATION MONSOON PRECIPITATION: Stiff food expense moisture pouring wet drench on middle-market valuations. Portfolios taking shelter.",
        zht: "【食品通膨濕冷低壓】高昂的糧食開支與進口成本帶來冷濕氣流。中盤成長股承受雨滴重壓，資金向下尋求支撐線。",
        zh: "【食品通胀湿冷低压】高昂的粮食开支与进口成本带来冷湿气流。中盘成长股承受雨滴重压，资金向下寻求支撑线。"
      },
      thunderstorms: {
        en: "MUMBAI LIQUIDITY DE-IONIZATION: Severe currency panic waves and abrupt foreign cash drainage gales breaking stock market power transformers.",
        zht: "【盧比匯率暴跌黑潮颶風】盧比匯率急挫引發外資毀滅性撤資暴風！大面積保證金閃電劈穿主板電網，交易板塊爆發恐慌洪澇！",
        zh: "【卢比汇率暴跌黑潮飓风】卢比汇率急挫引发外资毁灭性撤资风暴！大面积保证金闪电劈穿主板电网，交易板块爆发恐慌洪涝！"
      }
    },
    "DE": {
      clear_skies: {
        en: "ALPINE EXPORT HIGH-PRESSURE: Robust automobile export breeze blowing away Rhine valley smog, providing high-altitude sunny peaks for DAX.",
        zht: "【阿爾卑斯出口強高壓】歐元區藍籌出口與汽車製造氣壓增強！強力乾暖流為萊茵河谷驅除迷霧，DAX股指突破歷史最高溫標。",
        zh: "【阿尔卑斯出口强高压】欧元区蓝筹出口与汽车制造气压增强！强力干暖流为莱茵河谷驱除迷雾，DAX股指突破历史最高温标。"
      },
      partly_cloudy: {
        en: "EUROPEAN SUNLIGHT PATCHES: Steady chemical export orders keeping wind currents light and pleasant. Volatility humidity is low.",
        zht: "【歐洲工業微風陽光】化工與精密重工出口穩定，高空部分多雲與日照亮麗。市場波動度低，適宜低能耗航行。",
        zh: "【欧洲工业微风阳光】化工与精密重工出口稳定，高空部分多云与日照亮丽。市场波动度低，适宜低能耗航行。"
      },
      cloudy: {
        en: "RHINE FLAT OVERCAST: Dry industrial PMIs and stagnant capital convection freezing Frankfurt trade flows. Air is hazy and stationary.",
        zht: "【萊茵河枯水期阻滯陰天】製造業PMI疲軟，大盤雲層黏稠低空懸浮。法蘭克福上空風速靜止，大盤指針橫向磨牙。",
        zh: "【莱茵河枯水期阻滞阴天】东德制造PMI疲软，大盘云层粘稠低空悬浮。法兰克福上空风速静止，大盘指针横向磨牙。"
      },
      rainy: {
        en: "GAS COLD FRONT PRECIPITATION: Energy valuation cost dampness pouring cold drops on heavy machinery sectors.",
        zht: "【西歐能源危機陰雨】高企的天然氣發電成本轉化為冷細雨，澆淋重工業板塊。大盤氣溫走低，防禦性資金尋求避雨庇護。",
        zh: "【西欧能源危机阴雨】高企的天然气发电成本转化为冷细雨，浇淋重工业板块。大盘气温走低，防御性资金寻求避雨庇护。"
      },
      thunderstorms: {
        en: "SAXON ECONOMIC FROSTBITE: Extreme industrial gas embargo crisis creating severe freeze and massive capital liquidation lightning.",
        zht: "【德國製造業深冬超強暴風雪】工業供應鏈管道徹底冰凍！高通膨暴風攜帶連環融資斷頭閃電劈碎法蘭克福大盤，全歐警戒洪峰！",
        zh: "【德国制造业深冬超强暴风雪】工业供应链管道彻底冰冻！高通胀风暴携带连环融资断头闪电劈碎法兰克福大盘，全欧警戒洪峰！"
      }
    },
    "GB": {
      clear_skies: {
        en: "LONDON BRIGHT DAYLIGHT: Gushing mining & energy dividends generating pleasant radiative heating across FTSE 100 corridors.",
        zht: "【倫敦難得大晴天】跨國採礦巨頭與石化分紅回報提供強大熱能暖流！高空無雲，跨國資金極速湧入，推動富時指數攀上晴空脊。",
        zh: "【伦敦难得大晴天】跨国采矿巨头与石化分红回报提供强大热能暖流！高空无云，跨国资金极速涌入，推动富时指数攀上晴空脊。"
      },
      partly_cloudy: {
        en: "THAMES PLEASANT SEABREEZE: Flat retail inflation easing pressure on central bank. Financial clouds light and steady.",
        zht: "【泰晤士河溫和海風】零售通膨放緩降溫，央行利率壓力稍微散去。金融空域多雲見日，指數沿安全航線前行。",
        zh: "【泰晤士河温和海风】零售通胀放缓降温，央行利率压力稍微散去。金融空域多云见日，指数沿安全航线前行。"
      },
      cloudy: {
        en: "BRITISH PERPETUAL MIST: Heavy local housing dampness keeping trade winds inside flat parameters. Low dynamic drift.",
        zht: "// 大不列顛永恆濃霧\n【大不列顛永恆濃霧】本土住宅物業增長停滯，金融市區被一片白茫茫的防禦濃霧鎖定。風速微弱，多頭大盤原地整理。",
        zh: "【大不列颠永恒浓雾】本土住宅物业增长停滞，金融市区被一片白茫茫的防御浓雾锁定。风速微弱，多头大盘原地整理。"
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

  // Robust Default Custom Generation per state (for all other countries) preventing generic replication:
  const localizedUptextZht = isUp ? "多頭暖溫高壓" : "空頭低冷雨鋒";
  
  market.alert = `PECULIAR REGIONAL METEOROLOGY ALERT [${market.country}]: High dynamic ${isUp ? "BULLISH PRESSURE" : "BEARISH OUTFLOW"} detected over ${market.indexName} at ${market.indexValue} (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%). Air-pressure reading: ${market.pressure} hPa, volatility humidity: ${market.humidity}%. Avoid over-exposure.`;
  market.alertZh = `【${market.country}金融異常通告】區域測量雷達監測到大盤指數 ${market.indexName} 出现独特【${localizedUptextZht}】！当前气压 ${market.pressure} hPa，交易波动湿度 ${market.humidity}%，风速 ${market.windSpeed} km/h。`;
  market.alertZht = `【${market.country}金融異常通告】區域測量雷達監測到大盤指數 ${market.indexName} 出現獨特【${localizedUptextZht}】！當前氣壓 ${market.pressure} hPa，交易波動濕度 ${market.humidity}%，風速 ${market.windSpeed} km/h。`;
}

/// Predefined Initial Market Weather Database (Cache)
let marketCache: MarketWeather[] = [
  {
    country: "United States",
    code: "US",
    indexName: "S&P 500",
    indexValue: 7433.00,
    indexChange: 1.45,
    condition: "clear_skies",
    temperature: 29,
    pressure: 1024,
    humidity: 14,
    windSpeed: 38,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Japan",
    code: "JP",
    indexName: "Nikkei 225",
    indexValue: 42023.00,
    indexChange: 3.71,
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
    country: "India",
    code: "IN",
    indexName: "BSE SENSEX",
    indexValue: 75557.00,
    indexChange: 0.32,
    condition: "clear_skies",
    temperature: 32,
    pressure: 1026,
    humidity: 18,
    windSpeed: 42,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Germany",
    code: "DE",
    indexName: "DAX 40",
    indexValue: 24684.00,
    indexChange: -0.22,
    condition: "cloudy",
    temperature: 15,
    pressure: 1010,
    humidity: 42,
    windSpeed: 18,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "United Kingdom",
    code: "GB",
    indexName: "FTSE 100",
    indexValue: 10432.00,
    indexChange: 0.99,
    condition: "cloudy",
    temperature: 13,
    pressure: 1012,
    humidity: 35,
    windSpeed: 14,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "France",
    code: "FR",
    indexName: "CAC 40",
    indexValue: 8117.00,
    indexChange: 1.70,
    condition: "rainy",
    temperature: 17,
    pressure: 1004,
    humidity: 58,
    windSpeed: 23,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "China",
    code: "CN",
    indexName: "Shanghai Composite",
    indexValue: 4164.00,
    indexChange: 0.05,
    condition: "thunderstorms",
    temperature: 9,
    pressure: 994,
    humidity: 78,
    windSpeed: 54,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Australia",
    code: "AU",
    indexName: "ASX 200",
    indexValue: 8594.00,
    indexChange: 1.14,
    condition: "partly_cloudy",
    temperature: 17,
    pressure: 1014,
    humidity: 26,
    windSpeed: 19,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Brazil",
    code: "BR",
    indexName: "IBOVESPA",
    indexValue: 177356.00,
    indexChange: 1.77,
    condition: "rainy",
    temperature: 10,
    pressure: 1002,
    humidity: 62,
    windSpeed: 31,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Canada",
    code: "CA",
    indexName: "S&P/TSX Composite",
    indexValue: 34162.00,
    indexChange: 1.25,
    condition: "partly_cloudy",
    temperature: 16,
    pressure: 1015,
    humidity: 21,
    windSpeed: 21,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Taiwan",
    code: "TW",
    indexName: "TAIEX",
    indexValue: 21540.80,
    indexChange: 0.85,
    condition: "partly_cloudy",
    temperature: 24,
    pressure: 1018,
    humidity: 32,
    windSpeed: 34,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "South Korea",
    code: "KR",
    indexName: "KOSPI",
    indexValue: 2724.18,
    indexChange: 0.52,
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
    country: "Singapore",
    code: "SG",
    indexName: "Straits Times Index (STI)",
    indexValue: 3326.50,
    indexChange: -0.15,
    condition: "cloudy",
    temperature: 16,
    pressure: 1010,
    humidity: 44,
    windSpeed: 14,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Saudi Arabia",
    code: "SA",
    indexName: "Tadawul All Share Index (TASI)",
    indexValue: 12185.34,
    indexChange: 1.12,
    condition: "clear_skies",
    temperature: 28,
    pressure: 1022,
    humidity: 15,
    windSpeed: 25,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Malaysia",
    code: "MY",
    indexName: "FTSE Bursa Malaysia KLCI",
    indexValue: 1612.45,
    indexChange: 0.15,
    condition: "partly_cloudy",
    temperature: 25,
    pressure: 1014,
    humidity: 42,
    windSpeed: 16,
    alert: null,
    summary: "",
    economicAnalysis: "",
    outlook5Day: []
  },
  {
    country: "Indonesia",
    code: "ID",
    indexName: "IDX Composite",
    indexValue: 7180.50,
    indexChange: -0.35,
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
    country: "Thailand",
    code: "TH",
    indexName: "SET Index",
    indexValue: 1365.10,
    indexChange: 0.22,
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
    indexValue: 18610.50,
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

const SYMBOL_TO_COUNTRY: Record<string, string> = {
  "^GSPC": "United States",
  "^N225": "Japan",
  "^BSESN": "India",
  "^GDAXI": "Germany",
  "^FTSE": "United Kingdom",
  "^FCHI": "France",
  "000001.SS": "China",
  "^AXJO": "Australia",
  "^BVSP": "Brazil",
  "^GSPTSE": "Canada",
  "^TWII": "Taiwan",
  "^KS11": "South Korea",
  "^STI": "Singapore",
  "^KLSE": "Malaysia",
  "^JKSE": "Indonesia",
  "^SET.BK": "Thailand",
  "^TASI.SR": "Saudi Arabia",
  "^MXX": "Mexico",
  "^MERV": "Argentina",
  "^IPSA": "Chile",
  "^COLCAP": "Colombia",
  "^SPBLPGPT": "Peru",
  "^SSMI": "Switzerland",
  "FTSEMIB.MI": "Italy",
  "^IBEX": "Spain",
  "^AEX": "Netherlands",
  "^BFX": "Belgium",
  "^OMXSPI": "Sweden",
  "IMOEX.ME": "Russia",
  "XU100.IS": "Turkey",
  "^J200.JO": "South Africa",
  "^EGX30": "Egypt",
  "DFMGI.AE": "United Arab Emirates",
  "^WIG20": "Poland",
  "^ATX": "Austria",
  "^HSI": "Hong Kong",
  "^PSEI": "Philippines",
  "^VNINDEX": "Vietnam",
  "^NZ50": "New Zealand",
  "^KSE": "Pakistan"
};

function dynamicallyUpdateThematicData(market: MarketWeather) {
  const baseTemps: Record<string, number> = {
    "United States": 29, "Japan": 19, "India": 32, "Germany": 15, "United Kingdom": 13,
    "France": 17, "China": 9, "Australia": 17, "Brazil": 10, "Canada": 16, "Taiwan": 24,
    "South Korea": 18, "Singapore": 16, "Saudi Arabia": 28, "Malaysia": 25, "Indonesia": 26, 
    "Thailand": 27, "Mexico": 21, "Argentina": 14, "Chile": 16, "Colombia": 22, "Peru": 18,
    "Switzerland": 12, "Italy": 19, "Spain": 20, "Netherlands": 14, "Belgium": 14, "Sweden": 11,
    "Russia": 6, "Turkey": 17, "South Africa": 18, "Egypt": 26, "United Arab Emirates": 30,
    "Poland": 13, "Austria": 13, "Hong Kong": 22, "Philippines": 28, "Vietnam": 27, "New Zealand": 14,
    "Pakistan": 29
  };
  const baseT = baseTemps[market.country] ?? 20;
  market.temperature = Math.max(-5, Math.min(45, Math.round(baseT + market.indexChange * 1.5)));
  market.pressure = Math.round(1013.25 + (market.indexChange * 4.5));
  market.humidity = Math.max(10, Math.min(95, Math.round(35 - market.indexChange * 11)));
  market.windSpeed = Math.max(5, Math.min(90, Math.round(18 + Math.abs(market.indexChange) * 12)));

  // Generate 5-day consecutive trading outlook Trend dynamically
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

  // Unique country-specific alerts
  generateUniqueAlert(market);

  // Define bilingual dynamic content mappings with real indices parameters embedded!
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
    market.economicAnalysisZh = `全球AI服务器与高效芯片封装需求急速引爆，今日推升台股大盘变动达 ${market.indexChange}%。本国外销动能充沛，推动半导体多头气压计保持在優越的 ${market.pressure} hPa 高位。`;
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
    market.summaryZh = `南韩综合指数于 ${market.indexValue} 处低空盘旋 (${market.indexChange >= 0 ? "+" : ""}${market.indexChange}%)。高频宽芯片外销暖流正与外部冷气流激烈对冲。`;

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
    market.economicAnalysisZh = `原油输出与石化工业气氛依然炽热，今日推动中东大盘大幅上扬 ${market.indexChange}%。本土非油产业（願景2030）热风持续输送，护航估值大盘气压达到极佳的 ${market.pressure} hPa。`;
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

// Auto-populate default caching alerts/forecasts on start
marketCache.forEach(m => dynamicallyUpdateThematicData(m));

const TRANSLATED_SYMBOL_MAP: Record<string, string> = {
  "^EGX30": "^CASE30",
  "^WIG20": "WIG20.WA",
  "^PSEI": "PSEI.PS",
  "^VNINDEX": "VNM"
};

const REVERSE_TRANSLATED_SYMBOL_MAP: Record<string, string> = {};
for (const [orig, trans] of Object.entries(TRANSLATED_SYMBOL_MAP)) {
  REVERSE_TRANSLATED_SYMBOL_MAP[trans] = orig;
}

let lastYahooFetchTime = 0;
let isFetchingYahoo = false;

// Async function to helper-fetch a specific symbol from Yahoo chart API as a reliable fallback
async function fetchChartQuote(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  const transSymbol = TRANSLATED_SYMBOL_MAP[symbol] || symbol;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(transSymbol)}?interval=1d&range=1d`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    if (!res.ok) return null;
    const payload: any = await res.json();
    const meta = payload?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    let price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    if (typeof price === "number") {
      const changePercent = typeof prevClose === "number" && prevClose !== 0
        ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2))
        : 0;

      if (symbol === "^VNINDEX") {
        price = parseFloat((price * 66.16).toFixed(2));
      }
      return { price, changePercent };
    }
  } catch (e) {
    console.warn(`Chart fallback endpoint failed for ${symbol}:`, e);
  }
  return null;
}

// Dedicated real-time fetch function supporting official TWSE Open Data matching WantGoo
async function fetchTaiwanRealtimeIndex(): Promise<boolean> {
  const url = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://mis.twse.com.tw/"
      }
    });
    if (!res.ok) return false;
    const payload: any = await res.json();
    const item = payload?.msgArray?.[0];
    if (!item) return false;

    let priceVal = parseFloat(item.z);
    if (isNaN(priceVal) || priceVal <= 0) {
      priceVal = parseFloat(item.o) || parseFloat(item.y);
    }

    const prevCloseVal = parseFloat(item.y);
    if (priceVal > 0 && prevCloseVal > 0) {
      const changePercent = parseFloat((((priceVal - prevCloseVal) / prevCloseVal) * 100).toFixed(2));
      const market = marketCache.find(m => m.country === "Taiwan");
      if (market) {
        market.indexValue = parseFloat(priceVal.toFixed(2));
        market.indexChange = changePercent;

        // Set dynamic conditions for Taiwan meteorological reports
        if (changePercent >= 3.0) {
          market.condition = "clear_skies";
        } else if (changePercent >= 1.0) {
          market.condition = "partly_cloudy";
        } else if (changePercent >= -1.0) {
          market.condition = "cloudy";
        } else if (changePercent >= -3.0) {
          market.condition = "rainy";
        } else {
          market.condition = "thunderstorms";
        }
        dynamicallyUpdateThematicData(market);
        console.log(`TWSE System Sync: Updated Taiwan market (TAIEX) real-time index to ${priceVal} (${changePercent}%) matching WantGoo`);
        return true;
      }
    }
  } catch (error) {
    console.error("Failed to sync Taiwan real-time index from TWSE JSP API:", error);
  }
  return false;
}

// Async synchronization of live index values from Yahoo Finance public quote API
async function fetchYahooFinanceQuotes() {
  if (isFetchingYahoo) return;
  isFetchingYahoo = true;
  const symbols = Object.keys(SYMBOL_TO_COUNTRY);
  const translatedSymbols = symbols.map(s => TRANSLATED_SYMBOL_MAP[s] || s);
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${translatedSymbols.join(",")}`;
  const updatedSymbols = new Set<string>();

  // Synchronize Taiwan Index from official TWSE (WantGoo source authority) first for maximum accuracy
  try {
    const twSuccess = await fetchTaiwanRealtimeIndex();
    if (twSuccess) {
      updatedSymbols.add("^TWII");
    }
  } catch (twErr) {
    console.error("First-priority Taiwan Index sync failed:", twErr);
  }
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    
    if (res.ok) {
      const payload: any = await res.json();
      const result = payload?.quoteResponse?.result;
      if (Array.isArray(result)) {
        for (const item of result) {
          const transSymbol = item.symbol;
          const symbol = REVERSE_TRANSLATED_SYMBOL_MAP[transSymbol] || transSymbol;
          if (symbol === "^TWII" && updatedSymbols.has("^TWII")) {
            // Already updated with highly accurate official real-time TWSE API, skip Yahoo stale data
            continue;
          }
          const countryName = SYMBOL_TO_COUNTRY[symbol];
          if (!countryName) continue;

          let price = item.regularMarketPrice;
          const changePercent = item.regularMarketChangePercent;

          if (symbol === "^VNINDEX" && typeof price === "number") {
            price = parseFloat((price * 66.16).toFixed(2));
          }

          if (typeof price === "number" && typeof changePercent === "number") {
            const market = marketCache.find(m => m.country.toLowerCase() === countryName.toLowerCase());
            if (market) {
              market.indexValue = parseFloat(price.toFixed(2));
              market.indexChange = parseFloat(changePercent.toFixed(2));

              // Set dynamic weather meteorology conditions based on real-time market movement
              if (changePercent >= 3.0) {
                market.condition = "clear_skies";
              } else if (changePercent >= 1.0) {
                market.condition = "partly_cloudy";
              } else if (changePercent >= -1.0) {
                market.condition = "cloudy";
              } else if (changePercent >= -3.0) {
                market.condition = "rainy";
              } else {
                market.condition = "thunderstorms";
              }
              dynamicallyUpdateThematicData(market);
              updatedSymbols.add(symbol);
            }
          }
        }
      }
    } else {
      console.warn(`Yahoo Finance bulk quote API returned status: ${res.status}. Switching fully to chart fallbacks...`);
    }
  } catch (err) {
    console.error("Bulk Yahoo Finance fetch errored, will attempt individual chart fallbacks:", err);
  }

  // Fallback step: For any symbol that was NOT updated by bulk fetch, query chart API directly
  for (const symbol of symbols) {
    if (!updatedSymbols.has(symbol)) {
      const countryName = SYMBOL_TO_COUNTRY[symbol];
      console.log(`Triggering chart fallback for ${countryName} (${symbol})...`);
      const fallbackData = await fetchChartQuote(symbol);
      if (fallbackData) {
        const market = marketCache.find(m => m.country.toLowerCase() === countryName.toLowerCase());
        if (market) {
          market.indexValue = parseFloat(fallbackData.price.toFixed(2));
          market.indexChange = parseFloat(fallbackData.changePercent.toFixed(2));

          const changePercent = fallbackData.changePercent;
          if (changePercent >= 3.0) {
            market.condition = "clear_skies";
          } else if (changePercent >= 1.0) {
            market.condition = "partly_cloudy";
          } else if (changePercent >= -1.0) {
            market.condition = "cloudy";
          } else if (changePercent >= -3.0) {
            market.condition = "rainy";
          } else {
            market.condition = "thunderstorms";
          }
          dynamicallyUpdateThematicData(market);
          updatedSymbols.add(symbol);
          console.log(`Chart fallback successfully updated ${countryName} (${symbol}): ${fallbackData.price}`);
        }
      } else {
        console.warn(`Failed to retrieve live data for ${countryName} (${symbol}) from all fallbacks.`);
      }
    }
  }

  lastYahooFetchTime = Date.now();
  console.log(`Yahoo Finance synchronization session completed. Updated ${updatedSymbols.size}/${symbols.length} indices.`);
  isFetchingYahoo = false;
}

// Fire an initial fetch on startup
fetchYahooFinanceQuotes().catch(console.error);

// Auto-refresh from Yahoo Finance on the server side every 5 minutes
setInterval(() => {
  console.log("Server Scheduled Task: Refreshing Yahoo Finance stock indices and updating meteorological reports...");
  fetchYahooFinanceQuotes().catch(console.error);
}, 5 * 60 * 1000);

// Helper to slightly randomize current values to simulate active dynamic weather
// When Yahoo Finance data is extremely fresh, we keep fluctuation close to zero to preserve accuracy
function getRandomizedCache(): MarketWeather[] {
  const isFresh = (Date.now() - lastYahooFetchTime) < 30000; // less than 30 seconds since sync
  return marketCache.map(m => {
    // If not fresh, apply tiny 0.05% fluctuation just to show live active weather readings
    const scale = isFresh ? 1.0 : (1 + (Math.random() - 0.5) * 0.0006);
    const value = parseFloat((m.indexValue * scale).toFixed(2));
    const delta = isFresh ? m.indexChange : parseFloat((m.indexChange + (Math.random() - 0.5) * 0.04).toFixed(2));
    
    const humidityRandom = Math.floor(Math.max(10, Math.min(90, m.humidity + (Math.random() * 4 - 2))));
    const windRandom = Math.floor(Math.max(5, m.windSpeed + (Math.random() * 2 - 1)));
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
app.get("/api/markets", async (req, res) => {
  const force = req.query.force === "true";
  
  if (force) {
    console.log("Forced live recalibration requested from network time...");
    // Clear lock if forced so it guarantees immediate updates
    isFetchingYahoo = false; 
    await fetchYahooFinanceQuotes().catch(err => console.error("Forced update error:", err));
  } else if (Date.now() - lastYahooFetchTime > 15000) {
    // Stale-While-Revalidate: Trigger background update if cache older than 15s
    fetchYahooFinanceQuotes().catch(err => console.error("Stale revalidate error:", err));
  }

  res.json({
    status: "ok",
    isAiInteractive: !!ai,
    markets: getRandomizedCache(),
    lastUpdatedTime: lastYahooFetchTime
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
            outlook5Day: {
              type: Type.ARRAY,
              description: "A 5-day trading weather trend outline starting from Mon to Fri",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "E.g. Mon, Tue, Wed, Thu, Fri" },
                  condition: { type: Type.STRING, description: "Exactly one of: 'clear_skies', 'partly_cloudy', 'cloudy', 'rainy', 'thunderstorms'" },
                  temp: { type: Type.NUMBER, description: "Expected day temperature in °C" },
                  change: { type: Type.NUMBER, description: "Expected index change percentage" }
                },
                required: ["day", "condition", "temp", "change"]
              }
            }
          },
          required: ["country", "code", "indexName", "indexValue", "indexChange", "condition", "temperature", "pressure", "humidity", "windSpeed", "summary", "economicAnalysis", "outlook5Day"]
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
    outlook5Day: sampleOutlook
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

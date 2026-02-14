const teamSelect = document.getElementById("teamSelect");
const toggleScriptBtn = document.getElementById("toggleScriptBtn");
const fontSize = document.getElementById("fontSize");
const teamMeta = document.getElementById("teamMeta");
const tabs = document.getElementById("tabs");
const listPanelTitle = document.getElementById("listPanelTitle");
const panelTitleActions = document.querySelector(".panel-title-actions");
const itemList = document.getElementById("itemList");
const detailTitle = document.getElementById("detailTitle");
const detailView = document.getElementById("detailView");
const detailPanel = document.getElementById("detailPanel");
const openSelectionRulesBtn = document.getElementById("openSelectionRulesBtn");
const selectionRulesOverlay = document.getElementById("selectionRulesOverlay");
const closeSelectionRulesBtn = document.getElementById("closeSelectionRulesBtn");
const selectionRulesTitle = document.getElementById("selectionRulesTitle");
const selectionRulesContent = document.getElementById("selectionRulesContent");
let ruleModalRoot = document.getElementById("ruleModalRoot");
if (!ruleModalRoot) {
  ruleModalRoot = document.createElement("div");
  ruleModalRoot.id = "ruleModalRoot";
  document.body.appendChild(ruleModalRoot);
}
const resetPloyChecksBtn = document.getElementById("resetPloyChecksBtn");
const unitFilterBtn = document.getElementById("unitFilterBtn");
const equipmentFilterBtn = document.getElementById("equipmentFilterBtn");
const resetWoundsBtn = document.getElementById("resetWoundsBtn");
const openScoreBtn = document.getElementById("openScoreBtn");
const scoreOverlay = document.getElementById("scoreOverlay");
const closeScoreBtn = document.getElementById("closeScoreBtn");
const scoreResetBtn = document.getElementById("scoreResetBtn");
const scoreExportBtn = document.getElementById("scoreExportBtn");
const scoreResetLogBtn = document.getElementById("scoreResetLogBtn");
const scoreResetAllBtn = document.getElementById("scoreResetAllBtn");
const scoreTimerDisplay = document.getElementById("scoreTimerDisplay");
const scoreTimerStartBtn = document.getElementById("scoreTimerStartBtn");
const scoreTimerPauseBtn = document.getElementById("scoreTimerPauseBtn");
const scoreTimerEndBtn = document.getElementById("scoreTimerEndBtn");
const scoreP1Name = document.getElementById("scoreP1Name");
const scoreP2Name = document.getElementById("scoreP2Name");
const scoreNotes = document.getElementById("scoreNotes");
const scorePlayLogList = document.getElementById("scorePlayLogList");

if (tabs && tabs.parentElement !== document.body) {
  document.body.appendChild(tabs);
}

let doc = { teams: [] };
let enDoc = { teams: [] };
let currentTeamId = "";
let currentTab = "units";
let currentItemId = "";
let weaponChecks = {};
let listChecks = {};
let unitWounds = {};
let weaponRules = { rules: {} };
let universalEquipment = { equipment: [] };
let selectedWeaponRuleKey = "";
let selectedWeaponRuleLabel = "";
let unitCheckedOnly = false;
let equipmentCheckedOnly = false;
let showEnglishCompare = false;
const RULE_ALIASES = {
  "眩晕": "晕眩",
  "眩暈": "晕眩",
  "暈眩": "晕眩"
};
let timerRunning = false;
let timerHasStarted = false;
let timerElapsedMs = 0;
let timerStartAt = 0;
let timerIntervalId = null;
let selectionRulesLastFocus = null;
let scoreState = {
  p1_name: "",
  p1_bonus: "main",
  p1_r1_main: 0,
  p1_r1_secondary: 0,
  p1_r1_kill: 0,
  p1_r2_main: 0,
  p1_r2_secondary: 0,
  p1_r2_kill: 0,
  p1_r3_main: 0,
  p1_r3_secondary: 0,
  p1_r3_kill: 0,
  p1_r4_main: 0,
  p1_r4_secondary: 0,
  p1_r4_kill: 0,
  p2_name: "",
  p2_bonus: "main",
  p2_r1_main: 0,
  p2_r1_secondary: 0,
  p2_r1_kill: 0,
  p2_r2_main: 0,
  p2_r2_secondary: 0,
  p2_r2_kill: 0,
  p2_r3_main: 0,
  p2_r3_secondary: 0,
  p2_r3_kill: 0,
  p2_r4_main: 0,
  p2_r4_secondary: 0,
  p2_r4_kill: 0,
  play_log: [],
  notes: ""
};

const WEAPON_CHECKS_KEY = "kt_weapon_checks_v1";
const LIST_CHECKS_KEY = "kt_list_checks_v1";
const UNIT_FILTER_KEY = "kt_units_checked_only_v1";
const EQUIPMENT_FILTER_KEY = "kt_equipment_checked_only_v1";
const UNIT_WOUNDS_KEY = "kt_unit_wounds_v1";
const SCORE_STATE_KEY = "kt_score_state_v1";
const SCRIPT_MODE_KEY = "kt_script_mode_v1";
let scriptMode = "zh-CN";

const TRAD_PHRASE_MAP = {
  "战略计谋": "戰略計謀",
  "交战计谋": "交戰計謀",
  "阵营装备": "陣營裝備",
  "阵营规则": "陣營規則",
  "武器规则": "武器規則",
  "转折点": "轉折點",
  "战斗": "戰鬥",
  "伤害": "傷害",
  "掷骰": "擲骰",
  "关键成功": "關鍵成功",
  "关键穿刺": "關鍵穿刺",
  "重掷": "重擲",
  "残废": "殘廢",
  "标识": "標識",
  "移动": "移動",
  "规则": "規則",
  "队长": "隊長",
  "队伍": "隊伍",
  "单位": "單位",
  "侦察": "偵察",
  "领袖": "領袖",
  "战役": "戰役",
  "标记": "標記",
  "关键字": "關鍵字",
  "击杀": "擊殺",
  "后撤": "後撤"
};

const TRAD_CHAR_MAP = {
  "战": "戰", "术": "術", "计": "計", "谋": "謀", "阵": "陣", "营": "營", "规": "規", "则": "則",
  "伤": "傷", "击": "擊", "杀": "殺", "转": "轉", "为": "為", "与": "與", "将": "將", "并": "並",
  "掷": "擲", "残": "殘", "废": "廢", "标": "標", "识": "識", "见": "見", "级": "級",
  "敌": "敵", "时": "時", "动": "動", "风": "風", "灵": "靈", "毁": "毀", "灭": "滅",
  "护": "護", "网": "網", "减": "減", "药": "藥", "疗": "療", "测": "測", "过": "過",
  "这": "這", "个": "個", "么": "麼", "们": "們", "对": "對", "后": "後", "发": "發",
  "进": "進", "体": "體", "开": "開", "关": "關", "门": "門", "样": "樣", "从": "從",
  "两": "兩", "点": "點", "应": "應", "当": "當", "让": "讓", "内": "內", "圣": "聖",
  "装": "裝", "备": "備", "坚": "堅", "锤": "錘", "枪": "槍", "剑": "劍", "链": "鏈",
  "锯": "鋸", "导": "導", "阶": "階", "电": "電", "压": "壓", "复": "復", "苏": "蘇",
  "长": "長", "领": "領", "亚": "亞", "异": "異", "隐": "隱", "晕": "暈",
  "简": "簡", "侦": "偵", "佣": "傭", "众": "眾", "优": "優", "会": "會",
  "伞": "傘", "传": "傳", "伤": "傷", "伦": "倫", "伪": "偽", "侧": "側",
  "侦": "偵", "储": "儲", "儿": "兒", "党": "黨", "册": "冊", "写": "寫",
  "军": "軍", "农": "農", "冲": "衝", "决": "決", "净": "淨", "凉": "涼",
  "减": "減", "凑": "湊", "击": "擊", "刘": "劉", "划": "劃", "剧": "劇",
  "办": "辦", "务": "務", "势": "勢", "勋": "勳", "匀": "勻", "区": "區",
  "协": "協", "单": "單", "卖": "賣", "卢": "盧", "卫": "衛", "却": "卻",
  "厂": "廠", "历": "歷", "压": "壓", "厌": "厭", "县": "縣", "叁": "參",
  "双": "雙", "发": "發", "变": "變", "叙": "敘", "叶": "葉", "号": "號",
  "后": "後", "启": "啟", "吴": "吳", "员": "員", "响": "響", "问": "問",
  "啰": "囉", "围": "圍", "图": "圖", "圆": "圓", "国": "國", "圣": "聖",
  "场": "場", "坏": "壞", "块": "塊", "坚": "堅", "坛": "壇", "坠": "墜",
  "垄": "壟", "垒": "壘", "处": "處", "备": "備", "复": "復", "够": "夠",
  "头": "頭", "夹": "夾", "夺": "奪", "奋": "奮", "奖": "獎", "妈": "媽",
  "妇": "婦", "孙": "孫", "学": "學", "宁": "寧", "实": "實", "审": "審",
  "宫": "宮", "宽": "寬", "宾": "賓", "对": "對", "寻": "尋", "导": "導",
  "寿": "壽", "将": "將", "尘": "塵", "尔": "爾", "尝": "嘗", "层": "層",
  "属": "屬", "岁": "歲", "岂": "豈", "岗": "崗", "岛": "島", "岭": "嶺",
  "岳": "嶽", "峡": "峽", "币": "幣", "帅": "帥", "师": "師", "帐": "帳",
  "帘": "簾", "帮": "幫", "带": "帶", "库": "庫", "应": "應", "庙": "廟",
  "广": "廣", "庆": "慶", "庐": "廬", "废": "廢", "开": "開", "异": "異",
  "弃": "棄", "张": "張", "弥": "彌", "归": "歸", "当": "當", "录": "錄",
  "彻": "徹", "忆": "憶", "忧": "憂", "怀": "懷", "态": "態", "总": "總",
  "恋": "戀", "惊": "驚", "惧": "懼", "惯": "慣", "戏": "戲", "户": "戶",
  "战": "戰", "护": "護", "报": "報", "担": "擔", "拟": "擬", "择": "擇",
  "拢": "攏", "拥": "擁", "挂": "掛", "挥": "揮", "损": "損", "换": "換",
  "据": "據", "掳": "擄", "掷": "擲", "掸": "撣", "掺": "摻", "插": "插",
  "揽": "攬", "敌": "敵", "数": "數", "断": "斷", "时": "時", "显": "顯",
  "晋": "晉", "晒": "曬", "晓": "曉", "暂": "暫", "术": "術", "杂": "雜",
  "权": "權", "条": "條", "来": "來", "杨": "楊", "极": "極", "构": "構",
  "枪": "槍", "枢": "樞", "样": "樣", "树": "樹", "桥": "橋", "检": "檢",
  "楼": "樓", "横": "橫", "欢": "歡", "步": "步", "岁": "歲", "毁": "毀",
  "气": "氣", "汇": "匯", "汉": "漢", "汤": "湯", "沟": "溝", "没": "沒",
  "洁": "潔", "测": "測", "济": "濟", "浓": "濃", "涛": "濤", "灭": "滅",
  "灯": "燈", "灵": "靈", "灾": "災", "炉": "爐", "点": "點", "炼": "煉",
  "热": "熱", "烟": "煙", "烦": "煩", "烧": "燒", "烛": "燭", "爱": "愛",
  "爷": "爺", "牵": "牽", "状": "狀", "犹": "猶", "猎": "獵", "猫": "貓",
  "献": "獻", "环": "環", "现": "現", "电": "電", "画": "畫", "畅": "暢",
  "疗": "療", "疮": "瘡", "疯": "瘋", "监": "監", "盖": "蓋", "盘": "盤",
  "着": "著", "睁": "睜", "确": "確", "碍": "礙", "礼": "禮", "祸": "禍",
  "离": "離", "种": "種", "稳": "穩", "窥": "窺", "竞": "競", "笔": "筆",
  "笼": "籠", "签": "簽", "简": "簡", "粮": "糧", "纪": "紀", "纤": "纖",
  "约": "約", "级": "級", "纳": "納", "纵": "縱", "纸": "紙", "纹": "紋",
  "线": "線", "练": "練", "组": "組", "绅": "紳", "细": "細", "织": "織",
  "终": "終", "绍": "紹", "经": "經", "绑": "綁", "结": "結", "给": "給",
  "绝": "絕", "统": "統", "继": "繼", "续": "續", "绳": "繩", "维": "維",
  "综": "綜", "绿": "綠", "缓": "緩", "编": "編", "缘": "緣", "缝": "縫",
  "缩": "縮", "缴": "繳", "网": "網", "罗": "羅", "罚": "罰", "职": "職",
  "联": "聯", "聪": "聰", "肃": "肅", "肠": "腸", "肤": "膚", "脏": "臟",
  "脚": "腳", "脱": "脫", "脸": "臉", "舰": "艦", "艺": "藝", "节": "節",
  "苏": "蘇", "范": "範", "荣": "榮", "药": "藥", "获": "獲", "虫": "蟲",
  "虽": "雖", "蚀": "蝕", "蚁": "蟻", "补": "補", "装": "裝", "袭": "襲",
  "见": "見", "规": "規", "觉": "覺", "览": "覽", "触": "觸", "订": "訂",
  "计": "計", "认": "認", "讨": "討", "让": "讓", "讯": "訊", "议": "議",
  "记": "記", "讲": "講", "讳": "諱", "讶": "訝", "许": "許", "论": "論",
  "设": "設", "访": "訪", "证": "證", "评": "評", "词": "詞", "译": "譯",
  "试": "試", "诗": "詩", "诚": "誠", "话": "話", "该": "該", "详": "詳",
  "语": "語", "误": "誤", "说": "說", "请": "請", "诸": "諸", "诺": "諾",
  "读": "讀", "课": "課", "谁": "誰", "调": "調", "谈": "談", "谋": "謀",
  "谍": "諜", "谢": "謝", "谣": "謠", "谱": "譜", "贝": "貝", "负": "負",
  "财": "財", "责": "責", "败": "敗", "账": "賬", "货": "貨", "质": "質",
  "购": "購", "贯": "貫", "贱": "賤", "赏": "賞", "赔": "賠", "赖": "賴",
  "赘": "贅", "赢": "贏", "赵": "趙", "赶": "趕", "趋": "趨", "跃": "躍",
  "轨": "軌", "轮": "輪", "软": "軟", "转": "轉", "轻": "輕", "载": "載",
  "较": "較", "辅": "輔", "辆": "輛", "边": "邊", "辽": "遼", "达": "達",
  "迁": "遷", "过": "過", "还": "還", "这": "這", "进": "進", "远": "遠",
  "违": "違", "连": "連", "迟": "遲", "适": "適", "选": "選", "递": "遞",
  "逻": "邏", "遗": "遺", "邮": "郵", "邻": "鄰", "郁": "鬱", "郑": "鄭",
  "酱": "醬", "释": "釋", "里": "裡", "鉴": "鑑", "针": "針", "钟": "鐘",
  "钢": "鋼", "钥": "鑰", "钉": "釘", "钩": "鉤", "钱": "錢", "钳": "鉗",
  "钻": "鑽", "铁": "鐵", "铃": "鈴", "铜": "銅", "铠": "鎧", "银": "銀",
  "铭": "銘", "铺": "鋪", "链": "鏈", "销": "銷", "锁": "鎖", "锅": "鍋",
  "锤": "錘", "锻": "鍛", "键": "鍵", "锯": "鋸", "镇": "鎮", "镜": "鏡",
  "长": "長", "门": "門", "闭": "閉", "问": "問", "闲": "閒", "间": "間",
  "闷": "悶", "闻": "聞", "阁": "閣", "队": "隊", "际": "際", "阳": "陽",
  "阴": "陰", "阵": "陣", "阶": "階", "随": "隨", "隐": "隱", "难": "難",
  "雾": "霧", "静": "靜", "预": "預", "领": "領", "颇": "頗", "频": "頻",
  "题": "題", "颜": "顏", "额": "額", "风": "風", "飞": "飛", "饥": "飢",
  "饭": "飯", "饮": "飲", "饰": "飾", "馆": "館", "驱": "驅", "验": "驗",
  "驳": "駁", "驻": "駐", "骑": "騎", "骗": "騙", "骚": "騷", "骤": "驟",
  "鱼": "魚", "鲜": "鮮", "鸣": "鳴", "鸭": "鴨", "鸡": "雞", "麦": "麥",
  "黄": "黃", "点": "點", "齐": "齊", "龙": "龍"
};

function loadWeaponChecks() {
  try {
    weaponChecks = JSON.parse(localStorage.getItem(WEAPON_CHECKS_KEY) || "{}");
  } catch {
    weaponChecks = {};
  }
}

function saveWeaponChecks() {
  localStorage.setItem(WEAPON_CHECKS_KEY, JSON.stringify(weaponChecks));
}

function loadListChecks() {
  try {
    listChecks = JSON.parse(localStorage.getItem(LIST_CHECKS_KEY) || "{}");
  } catch {
    listChecks = {};
  }
}

function saveListChecks() {
  localStorage.setItem(LIST_CHECKS_KEY, JSON.stringify(listChecks));
}

function loadUnitFilter() {
  unitCheckedOnly = localStorage.getItem(UNIT_FILTER_KEY) === "1";
}

function saveUnitFilter() {
  localStorage.setItem(UNIT_FILTER_KEY, unitCheckedOnly ? "1" : "0");
}

function updateUnitFilterBtnLabel() {
  unitFilterBtn.textContent = unitCheckedOnly ? "單位：只顯示勾選" : "單位：顯示全部";
}

function loadEquipmentFilter() {
  equipmentCheckedOnly = localStorage.getItem(EQUIPMENT_FILTER_KEY) === "1";
}

function saveEquipmentFilter() {
  localStorage.setItem(EQUIPMENT_FILTER_KEY, equipmentCheckedOnly ? "1" : "0");
}

function updateEquipmentFilterBtnLabel() {
  if (!equipmentFilterBtn) return;
  equipmentFilterBtn.textContent = equipmentCheckedOnly ? "裝備：只顯示勾選" : "裝備：顯示全部";
}

function loadUnitWounds() {
  try {
    unitWounds = JSON.parse(localStorage.getItem(UNIT_WOUNDS_KEY) || "{}");
  } catch {
    unitWounds = {};
  }
}

function saveUnitWounds() {
  localStorage.setItem(UNIT_WOUNDS_KEY, JSON.stringify(unitWounds));
}

function loadScriptMode() {
  const saved = localStorage.getItem(SCRIPT_MODE_KEY);
  scriptMode = saved === "zh-Hant" ? "zh-Hant" : "zh-CN";
  updateScriptButtonLabel();
}

function saveScriptMode() {
  localStorage.setItem(SCRIPT_MODE_KEY, scriptMode);
}

function updateScriptButtonLabel() {
  if (!toggleScriptBtn) return;
  const isTrad = scriptMode === "zh-Hant";
  toggleScriptBtn.textContent = isTrad ? "簡/繁：繁" : "簡/繁：簡";
  toggleScriptBtn.title = isTrad ? "目前：繁體（點擊切換簡體）" : "目前：简体（點擊切換繁體）";
  toggleScriptBtn.classList.toggle("is-trad", isTrad);
  document.documentElement.lang = isTrad ? "zh-Hant" : "zh-Hans";
  document.body.dataset.scriptMode = scriptMode;
}

function loadScoreState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCORE_STATE_KEY) || "{}");
    scoreState = {
      ...scoreState,
      ...parsed
    };
    // 相容舊版：若存在舊欄位，轉成 R1 主/副/擊殺。
    if (Number.isFinite(Number(parsed.p1_primary_vp))) scoreState.p1_r1_main = Number(parsed.p1_primary_vp);
    if (Number.isFinite(Number(parsed.p1_secondary_vp))) scoreState.p1_r1_secondary = Number(parsed.p1_secondary_vp);
    if (Number.isFinite(Number(parsed.p1_kill_vp))) scoreState.p1_r1_kill = Number(parsed.p1_kill_vp);
    if (Number.isFinite(Number(parsed.p2_primary_vp))) scoreState.p2_r1_main = Number(parsed.p2_primary_vp);
    if (Number.isFinite(Number(parsed.p2_secondary_vp))) scoreState.p2_r1_secondary = Number(parsed.p2_secondary_vp);
    if (Number.isFinite(Number(parsed.p2_kill_vp))) scoreState.p2_r1_kill = Number(parsed.p2_kill_vp);
    if (Number.isFinite(Number(parsed.p1_r1_vp))) scoreState.p1_r1_main = Number(parsed.p1_r1_vp);
    if (Number.isFinite(Number(parsed.p2_r1_vp))) scoreState.p2_r1_main = Number(parsed.p2_r1_vp);
    if (!["main", "secondary", "kill"].includes(scoreState.p1_bonus)) scoreState.p1_bonus = "main";
    if (!["main", "secondary", "kill"].includes(scoreState.p2_bonus)) scoreState.p2_bonus = "main";
    if (!Array.isArray(scoreState.play_log)) scoreState.play_log = [];
  } catch { }
}

function saveScoreState() {
  localStorage.setItem(SCORE_STATE_KEY, JSON.stringify(scoreState));
}

function clampScoreValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function getRoundTotal(prefix, round) {
  return (
    clampScoreValue(scoreState[`${prefix}_${round}_main`]) +
    clampScoreValue(scoreState[`${prefix}_${round}_secondary`]) +
    clampScoreValue(scoreState[`${prefix}_${round}_kill`])
  );
}

function getCategoryTotal(prefix, category) {
  return (
    clampScoreValue(scoreState[`${prefix}_r1_${category}`]) +
    clampScoreValue(scoreState[`${prefix}_r2_${category}`]) +
    clampScoreValue(scoreState[`${prefix}_r3_${category}`]) +
    clampScoreValue(scoreState[`${prefix}_r4_${category}`])
  );
}

function getGrandTotalVp(prefix) {
  const baseTotal = (
    getRoundTotal(prefix, "r1") +
    getRoundTotal(prefix, "r2") +
    getRoundTotal(prefix, "r3") +
    getRoundTotal(prefix, "r4")
  );
  const bonusKey = scoreState[`${prefix}_bonus`];
  if (!["main", "secondary", "kill"].includes(bonusKey)) return baseTotal;
  const bonusSum = getCategoryTotal(prefix, bonusKey);
  const weightedTotal = baseTotal - bonusSum + bonusSum * 1.5;
  return Math.round(weightedTotal);
}

function getBonusLabel(key) {
  if (key === "main") return "主";
  if (key === "secondary") return "副";
  if (key === "kill") return "擊殺";
  return "主";
}

function getCurrentActorName() {
  const n1 = (scoreState.p1_name || "").trim();
  const n2 = (scoreState.p2_name || "").trim();
  if (n1) return n1;
  if (n2) return n2;
  return "玩家名稱";
}

function getPlayerName(prefix) {
  if (prefix === "p1") return (scoreState.p1_name || "").trim() || "玩家A";
  if (prefix === "p2") return (scoreState.p2_name || "").trim() || "玩家B";
  return getCurrentActorName();
}

function getVpCategoryLabel(category) {
  if (category === "main") return "主";
  if (category === "secondary") return "副";
  if (category === "kill") return "擊殺";
  return category;
}

function addPlayLogEvent(actionText, actorName = "") {
  if (!timerHasStarted) return;
  const at = formatTimer(getCurrentElapsedMs());
  const actor = actorName || getCurrentActorName();
  const line = `${actor} ${at}-${actionText}`;
  scoreState.play_log = [...(scoreState.play_log || []), line].slice(-300);
  saveScoreState();
  renderPlayLogUI();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatNowForFilename() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

const REQUESTED_EXPORT_SCALE = 1;
const EXPORT_TEXT_MULTIPLIER = 3;
const EXPORT_BASE_W = 2480;
const EXPORT_MAX_CANVAS = 8192;

function getExportScale() {
  return Math.min(REQUESTED_EXPORT_SCALE, EXPORT_MAX_CANVAS / EXPORT_BASE_W);
}

function exportUnit(value, scale) {
  return Math.max(1, Math.floor(value * scale));
}

function exportTextUnit(value, scale) {
  return Math.max(1, Math.floor(value * scale * EXPORT_TEXT_MULTIPLIER));
}

function exportFont(sizePx, weight = "400", scale = 1) {
  return `${weight} ${exportTextUnit(sizePx, scale)}px 'Noto Sans TC', 'PingFang TC', sans-serif`;
}

function wrapTextLines(ctx, text, maxWidth) {
  const source = String(text || "").replace(/\r/g, "");
  const paragraphs = source.split("\n");
  const lines = [];
  for (const p of paragraphs) {
    if (!p) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const ch of p) {
      const test = line + ch;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = ch;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function getPlayerTableHeight(scale) {
  const rowHeight = exportTextUnit(96, scale);
  const titleH = exportTextUnit(74, scale);
  const headH = exportTextUnit(80, scale);
  const totalH = exportTextUnit(86, scale);
  const bonusH = exportTextUnit(70, scale);
  return titleH + headH + rowHeight * 4 + totalH + bonusH;
}

function drawPlayerScoreTable(ctx, prefix, displayName, startX, startY, tableWidth, scale) {
  const rounds = ["r1", "r2", "r3", "r4"];
  const rowHeight = exportTextUnit(96, scale);
  const titleH = exportTextUnit(74, scale);
  const headH = exportTextUnit(80, scale);
  const totalH = exportTextUnit(86, scale);
  const bonusH = exportTextUnit(70, scale);
  const cols = [
    { key: "round", label: "回合", w: exportUnit(120, scale) },
    { key: "main", label: "主", w: exportUnit(120, scale) },
    { key: "secondary", label: "副", w: exportUnit(120, scale) },
    { key: "kill", label: "擊殺", w: exportUnit(120, scale) },
    { key: "subtotal", label: "小計", w: exportUnit(120, scale) }
  ];
  const fixedW = cols.reduce((s, c) => s + c.w, 0);
  const widthScale = tableWidth / fixedW;
  for (const c of cols) c.rw = Math.floor(c.w * widthScale);
  cols[cols.length - 1].rw += tableWidth - cols.reduce((s, c) => s + c.rw, 0);

  let y = startY;
  ctx.fillStyle = "#000";
  ctx.font = exportFont(48, "700", scale);
  ctx.fillText(displayName || (prefix === "p1" ? "玩家 A" : "玩家 B"), startX, y + exportTextUnit(54, scale));
  y += titleH;

  const drawRowGrid = (yy, height) => {
    let x = startX;
    ctx.strokeStyle = "#222";
    ctx.lineWidth = exportUnit(4, scale);
    for (const c of cols) {
      ctx.strokeRect(x, yy, c.rw, height);
      x += c.rw;
    }
  };

  drawRowGrid(y, headH);
  ctx.font = exportFont(40, "600", scale);
  ctx.fillStyle = "#111";
  {
    let x = startX;
    for (const c of cols) {
      ctx.fillText(c.label, x + exportUnit(20, scale), y + exportTextUnit(54, scale));
      x += c.rw;
    }
  }
  y += headH;

  ctx.font = exportFont(44, "500", scale);
  for (const round of rounds) {
    drawRowGrid(y, rowHeight);
    const values = {
      round: round.toUpperCase(),
      main: clampScoreValue(scoreState[`${prefix}_${round}_main`]),
      secondary: clampScoreValue(scoreState[`${prefix}_${round}_secondary`]),
      kill: clampScoreValue(scoreState[`${prefix}_${round}_kill`]),
      subtotal: getRoundTotal(prefix, round)
    };
    let x = startX;
    for (const c of cols) {
      ctx.fillText(String(values[c.key]), x + exportUnit(20, scale), y + exportTextUnit(62, scale));
      x += c.rw;
    }
    y += rowHeight;
  }

  ctx.fillStyle = "#f3f3f3";
  ctx.fillRect(startX, y, tableWidth, totalH);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = exportUnit(4, scale);
  ctx.strokeRect(startX, y, tableWidth, totalH);
  ctx.fillStyle = "#000";
  ctx.font = exportFont(50, "700", scale);
  ctx.fillText(`總VP：${getGrandTotalVp(prefix)}`, startX + exportUnit(20, scale), y + exportTextUnit(60, scale));
  y += totalH;

  ctx.strokeRect(startX, y, tableWidth, bonusH);
  ctx.font = exportFont(38, "500", scale);
  const bonusKey = scoreState[`${prefix}_bonus`] || "main";
  ctx.fillText(`加權 x1.5：${getBonusLabel(bonusKey)}`, startX + exportUnit(20, scale), y + exportTextUnit(48, scale));
  y += bonusH;

  return y;
}

function exportScoreA4Image() {
  const scale = getExportScale();
  const W = exportUnit(EXPORT_BASE_W, scale);
  const margin = exportUnit(96, scale);
  const topSafePad = exportTextUnit(90, scale);
  const bottomSafePad = exportTextUnit(160, scale);
  const contentW = W - margin * 2;
  let y = margin + topSafePad;

  // 先計算動態高度（備註長度會影響輸出高度）
  y += exportUnit(146, scale); // 標題與時間區
  y += getPlayerTableHeight(scale); // 玩家A表
  y += exportUnit(58, scale); // 表間距
  y += getPlayerTableHeight(scale); // 玩家B表
  y += exportUnit(68, scale); // 到備註前間距

  const notesTitleY = y + exportTextUnit(42, scale);
  const notesTop = notesTitleY + exportTextUnit(26, scale);
  const lineHeight = exportTextUnit(52, scale);
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = W;
  measureCanvas.height = 10;
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) return;
  measureCtx.font = exportFont(40, "400", scale);
  const noteLines = wrapTextLines(measureCtx, scoreState.notes || "", contentW - exportUnit(24, scale));
  const notesBoxH = Math.max(
    exportTextUnit(320, scale),
    exportTextUnit(110, scale) + noteLines.length * lineHeight
  );
  const logs = Array.isArray(scoreState.play_log) ? scoreState.play_log : [];
  const playLogTitleGap = exportTextUnit(70, scale);
  const playLogTitleY = notesTop + notesBoxH + playLogTitleGap;
  const playLogTop = playLogTitleY + exportTextUnit(26, scale);
  const playLogLines = wrapTextLines(measureCtx, logs.join("\n"), contentW - exportUnit(24, scale));
  const playLogBoxH = Math.max(
    exportTextUnit(260, scale),
    exportTextUnit(110, scale) + playLogLines.length * lineHeight
  );
  const H = playLogTop + playLogBoxH + margin + bottomSafePad;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);

  y = margin + topSafePad;

  ctx.fillStyle = "#000";
  ctx.font = exportFont(78, "700", scale);
  ctx.fillText("KT 計分表", margin, y);

  ctx.font = exportFont(40, "400", scale);
  const now = new Date();
  ctx.fillText(
    `匯出時間：${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    margin,
    y + exportTextUnit(66, scale)
  );
  y += exportTextUnit(146, scale);

  y = drawPlayerScoreTable(ctx, "p1", scoreState.p1_name || "玩家 A", margin, y, contentW, scale);
  y += exportTextUnit(58, scale);
  y = drawPlayerScoreTable(ctx, "p2", scoreState.p2_name || "玩家 B", margin, y, contentW, scale);
  y += exportTextUnit(68, scale);

  const notesTitleYDraw = y + exportTextUnit(42, scale);
  ctx.font = exportFont(48, "700", scale);
  ctx.fillStyle = "#000";
  ctx.fillText("備註", margin, notesTitleYDraw);

  const notesTopDraw = notesTitleYDraw + exportTextUnit(26, scale);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = exportUnit(4, scale);
  ctx.strokeRect(margin, notesTopDraw, contentW, notesBoxH);

  ctx.font = exportFont(40, "400", scale);
  let textY = notesTopDraw + exportTextUnit(64, scale);
  for (const line of noteLines) {
    if (textY > notesTopDraw + notesBoxH - exportTextUnit(36, scale)) break;
    ctx.fillText(line, margin + exportUnit(16, scale), textY);
    textY += exportTextUnit(52, scale);
  }

  const playLogTitleYDraw = notesTopDraw + notesBoxH + exportTextUnit(70, scale);
  ctx.font = exportFont(48, "700", scale);
  ctx.fillStyle = "#000";
  ctx.fillText("遊玩過程", margin, playLogTitleYDraw);

  const playLogTopDraw = playLogTitleYDraw + exportTextUnit(26, scale);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = exportUnit(4, scale);
  ctx.strokeRect(margin, playLogTopDraw, contentW, playLogBoxH);

  ctx.font = exportFont(40, "400", scale);
  let logY = playLogTopDraw + exportTextUnit(64, scale);
  for (const line of playLogLines) {
    if (logY > playLogTopDraw + playLogBoxH - exportTextUnit(36, scale)) break;
    ctx.fillText(line, margin + exportUnit(16, scale), logY);
    logY += exportTextUnit(52, scale);
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kt-score-a4-${formatNowForFilename()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function renderScoreUI() {
  scoreOverlay.querySelectorAll("[data-score-bind]").forEach((el) => {
    const key = el.getAttribute("data-score-bind");
    el.textContent = String(clampScoreValue(scoreState[key]));
  });
  scoreOverlay.querySelectorAll("[data-score-bind-round-total]").forEach((el) => {
    const token = el.getAttribute("data-score-bind-round-total"); // p1_r1
    const [prefix, round] = token.split("_");
    el.textContent = String(getRoundTotal(prefix, round));
  });
  scoreOverlay.querySelectorAll("[data-score-bind-grand-total]").forEach((el) => {
    const prefix = el.getAttribute("data-score-bind-grand-total");
    el.textContent = String(getGrandTotalVp(prefix));
  });
  scoreOverlay.querySelectorAll("[data-score-action='set-bonus']").forEach((btn) => {
    const player = btn.getAttribute("data-score-player");
    const bonus = btn.getAttribute("data-score-bonus");
    btn.classList.toggle("active", scoreState[`${player}_bonus`] === bonus);
  });
  scoreP1Name.value = scoreState.p1_name || "";
  scoreP2Name.value = scoreState.p2_name || "";
  scoreNotes.value = scoreState.notes || "";
  renderPlayLogUI();
  renderTimerUI();
}

function renderPlayLogUI() {
  if (!scorePlayLogList) return;
  const logs = Array.isArray(scoreState.play_log) ? scoreState.play_log : [];
  if (!logs.length) {
    scorePlayLogList.innerHTML = `<div class="empty">尚無記錄</div>`;
    return;
  }
  scorePlayLogList.innerHTML = logs
    .map((line) => `<div class="score-playlog-item">${escapeHtml(line)}</div>`)
    .join("");
}

function openScoreOverlay() {
  scoreOverlay.classList.remove("is-hidden");
  scoreOverlay.setAttribute("aria-hidden", "false");
  renderScoreUI();
}

function closeScoreOverlay() {
  scoreOverlay.classList.add("is-hidden");
  scoreOverlay.setAttribute("aria-hidden", "true");
}

function getSelectionRulesText(team) {
  if (!team) return "（此隊伍尚無特工選擇規則資料）";
  const rawRules = team.selection_rules;
  if (typeof rawRules === "string" && rawRules.trim()) return rawRules.trim();
  if (Array.isArray(rawRules) && rawRules.length) return rawRules.join("\n");

  const rawText = String(team.raw_text || "");
  if (!rawText.trim()) return "（此隊伍尚無特工選擇規則資料）";
  const text = rawText.replace(/\r/g, "").replace(/\f/g, "\n");

  const startMarkers = ["杀戮小队", "殺戮小隊", "» 杀戮小队选择", "» 殺戮小隊選擇"];
  let start = -1;
  for (const marker of startMarkers) {
    const idx = text.indexOf(marker);
    if (idx >= 0 && (start < 0 || idx < start)) start = idx;
  }
  if (start < 0) return "（此隊伍尚無特工選擇規則資料）";

  const endMarkers = ["阵营规则", "陣營規則", "标识/指示物指南", "標識/指示物指南", "战略计谋", "戰略計謀"];
  let end = text.length;
  for (const marker of endMarkers) {
    const idx = text.indexOf(marker, start + 1);
    if (idx > start && idx < end) end = idx;
  }

  const block = text
    .slice(start, end)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!block) return "（此隊伍尚無特工選擇規則資料）";
  return block;
}

function renderSelectionRulesOverlay() {
  const team = getTeam();
  if (selectionRulesTitle) selectionRulesTitle.textContent = convertForDisplay(`${team?.name || "隊伍"} 特工選擇規則`);
  if (selectionRulesContent) selectionRulesContent.textContent = convertForDisplay(getSelectionRulesText(team));
}

function openSelectionRulesOverlay() {
  if (!selectionRulesOverlay) return;
  selectionRulesLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  renderSelectionRulesOverlay();
  selectionRulesOverlay.removeAttribute("inert");
  selectionRulesOverlay.classList.remove("is-hidden");
  selectionRulesOverlay.setAttribute("aria-hidden", "false");
}

function closeSelectionRulesOverlay() {
  if (!selectionRulesOverlay) return;
  const active = document.activeElement;
  if (active instanceof HTMLElement && selectionRulesOverlay.contains(active)) {
    const focusBack = (selectionRulesLastFocus && selectionRulesLastFocus.isConnected)
      ? selectionRulesLastFocus
      : openSelectionRulesBtn;
    if (focusBack instanceof HTMLElement) {
      try {
        focusBack.focus({ preventScroll: true });
      } catch {
        focusBack.focus();
      }
    } else {
      active.blur();
    }
  }
  selectionRulesOverlay.classList.add("is-hidden");
  selectionRulesOverlay.setAttribute("aria-hidden", "true");
  selectionRulesOverlay.setAttribute("inert", "");
}

function formatTimer(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

function getCurrentElapsedMs() {
  if (!timerRunning) return timerElapsedMs;
  return Math.max(0, Date.now() - timerStartAt);
}

function updateTimerTick() {
  if (!scoreTimerDisplay) return;
  scoreTimerDisplay.textContent = formatTimer(getCurrentElapsedMs());
}

function setTimerInterval(enabled) {
  if (!enabled) {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = null;
    return;
  }
  if (timerIntervalId) return;
  timerIntervalId = setInterval(updateTimerTick, 500);
}

function renderTimerUI() {
  if (!scoreTimerDisplay || !scoreTimerStartBtn || !scoreTimerPauseBtn || !scoreTimerEndBtn) return;
  updateTimerTick();
  scoreTimerStartBtn.classList.toggle("is-hidden", timerHasStarted);
  scoreTimerPauseBtn.classList.toggle("is-hidden", !timerHasStarted);
  scoreTimerEndBtn.classList.toggle("is-hidden", !timerHasStarted);
  scoreTimerPauseBtn.textContent = timerRunning ? "暫停計時" : "繼續計時";
}

function startTimer() {
  if (!timerHasStarted) {
    timerHasStarted = true;
    timerElapsedMs = 0;
    scoreState.play_log = [];
    saveScoreState();
  }
  timerRunning = true;
  timerStartAt = Date.now() - timerElapsedMs;
  setTimerInterval(true);
  renderTimerUI();
}

function togglePauseTimer() {
  if (!timerHasStarted) return;
  if (timerRunning) {
    timerElapsedMs = getCurrentElapsedMs();
    timerRunning = false;
    setTimerInterval(false);
  } else {
    timerRunning = true;
    timerStartAt = Date.now() - timerElapsedMs;
    setTimerInterval(true);
  }
  renderTimerUI();
}

function endTimer() {
  timerRunning = false;
  timerHasStarted = false;
  timerElapsedMs = 0;
  timerStartAt = 0;
  setTimerInterval(false);
  renderTimerUI();
}

function weaponCheckKey(teamId, unitId, weaponName, index) {
  return `${teamId}__${unitId}__${weaponName}__${index}`;
}

function isWeaponChecked(key) {
  // Default checked: only explicit false means unchecked.
  return weaponChecks[key] !== false;
}

function listCheckKey(teamId, tabKey, itemId) {
  return `${teamId}__${tabKey}__${itemId}`;
}

function isUnitChecked(key) {
  // Unit default checked: only explicit false means unchecked.
  return listChecks[key] !== false;
}

function isEquipmentChecked(key) {
  // Equipment default checked: only explicit false means unchecked.
  return listChecks[key] !== false;
}

function unitWoundsKey(teamId, unitId) {
  return `${teamId}__${unitId}`;
}

function getCurrentWounds(teamId, unit) {
  const max = Number(unit?.stats?.wounds ?? 0);
  if (max <= 0) return 0;
  const key = unitWoundsKey(teamId, unit.id);
  const stored = Number(unitWounds[key]);
  if (!Number.isFinite(stored)) return max;
  return Math.max(0, Math.min(max, stored));
}

function clearRoundChecksForTeam(teamId) {
  const prefixes = [
    `${teamId}__strategic_ploys__`,
    `${teamId}__tactical_ploys__`
  ];
  for (const key of Object.keys(listChecks)) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      delete listChecks[key];
    }
  }
  saveListChecks();
}

function clearWoundsForTeam(teamId) {
  const prefix = `${teamId}__`;
  for (const key of Object.keys(unitWounds)) {
    if (key.startsWith(prefix)) {
      delete unitWounds[key];
    }
  }
  saveUnitWounds();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toTraditional(text) {
  let out = String(text ?? "");
  const phraseKeys = Object.keys(TRAD_PHRASE_MAP).sort((a, b) => b.length - a.length);
  for (const k of phraseKeys) out = out.split(k).join(TRAD_PHRASE_MAP[k]);
  out = out.split("").map((ch) => TRAD_CHAR_MAP[ch] || ch).join("");
  return out;
}

function convertForDisplay(value) {
  const raw = String(value ?? "");
  return scriptMode === "zh-Hant" ? toTraditional(raw) : raw;
}

function displayHtml(value) {
  return escapeHtml(convertForDisplay(value));
}

async function loadWeaponRules() {
  const candidates = [
    "data/weapon_rules_zh_cn.json",
    "./data/weapon_rules_zh_cn.json",
    "/data/weapon_rules_zh_cn.json",
    "weapon_rules_zh_cn.json"
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      weaponRules = await res.json();
      return;
    } catch { }
  }
  weaponRules = { rules: {} };
}

async function loadUniversalEquipment() {
  const candidates = [
    "data/universal_equipment_zh_cn.json",
    "./data/universal_equipment_zh_cn.json",
    "/data/universal_equipment_zh_cn.json",
    "universal_equipment_zh_cn.json"
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      universalEquipment = await res.json();
      if (!Array.isArray(universalEquipment.equipment)) {
        universalEquipment = { equipment: [] };
      }
      return;
    } catch { }
  }
  universalEquipment = { equipment: [] };
}

async function loadEnglishDoc() {
  const candidates = [
    "data/kt_teams_test_en.json",
    "./data/kt_teams_test_en.json",
    "/data/kt_teams_test_en.json",
    "kt_teams_test_en.json"
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const parsed = await res.json();
      if (Array.isArray(parsed?.teams)) {
        enDoc = parsed;
        return;
      }
    } catch { }
  }
  enDoc = { teams: [] };
}

function getRuleKey(token) {
  const t = toCanonicalRuleToken(token)
    .replace(/^\d+\s*[\"“”]?\s*/g, "");
  const keys = [
    "穿刺暴击", "关键穿刺", "穿刺", "精准", "平衡", "爆炸", "残暴", "无休", "毁灭", "重型",
    "过热", "致命", "有限", "重击", "范围", "毫不留情", "撕裂", "集中", "追踪",
    "严重", "震荡", "安静", "晕眩", "洪流", "灵能", "增幅", "毒素", "剧毒", "恐惧试剂", "乱射", "隐匿位置",
    "反灵能者", "护盾"
  ];
  return keys.find((k) => t.startsWith(k)) || "";
}

function toCanonicalRuleToken(token) {
  const t = normalizeRuleToken(token);
  return RULE_ALIASES[t] || t;
}

function normalizeRuleToken(token) {
  return String(token || "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderWeaponRulesCell(rawRules) {
  const text = normalizeRuleToken(rawRules);
  if (!text || text === "-") return "-";
  const tokens = text
    .split(/[、，,]/)
    .map((s) => normalizeRuleToken(s))
    .filter(Boolean);
  if (!tokens.length) return displayHtml(text);
  return `<div class="rule-chips">${tokens.map((token) => {
    const key = getRuleKey(token);
    if (!key || !weaponRules.rules?.[key]) return `<span>${displayHtml(token)}</span>`;
    const active = key === selectedWeaponRuleKey ? "active" : "";
    return `<button type="button" class="rule-chip ${active}" data-rule-key="${escapeHtml(key)}" data-rule-label="${escapeHtml(token)}">${displayHtml(token)}</button>`;
  }).join("")}</div>`;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLinkableRuleKeys() {
  return Array.from(new Set([
    ...Object.keys(weaponRules.rules || {}),
    ...Object.keys(RULE_ALIASES)
  ]))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

function shouldSkipRuleLink(text, key, index) {
  if (key !== "范围") return false;
  const prev2 = text.slice(Math.max(0, index - 2), index);
  return prev2 === "控制";
}

function renderTextWithRuleLinks(rawText) {
  const text = String(rawText ?? "");
  if (!text) return "";
  const keys = getLinkableRuleKeys();
  if (!keys.length) return displayHtml(text);
  const regex = new RegExp(`(${keys.map(escapeRegExp).join("|")})`, "g");
  let out = "";
  let last = 0;
  let match = regex.exec(text);
  while (match) {
    const idx = match.index;
    const rawKey = match[0];
    const key = RULE_ALIASES[rawKey] || rawKey;
    out += displayHtml(text.slice(last, idx));
    if (!weaponRules.rules?.[key] || shouldSkipRuleLink(text, key, idx)) {
      out += displayHtml(rawKey);
    } else {
      const active = key === selectedWeaponRuleKey ? "active" : "";
      out += `<button type="button" class="rule-chip ${active}" data-rule-key="${escapeHtml(key)}" data-rule-label="${escapeHtml(rawKey)}">${displayHtml(rawKey)}</button>`;
    }
    last = idx + rawKey.length;
    match = regex.exec(text);
  }
  out += displayHtml(text.slice(last));
  return out;
}

function normalizeAbilityText(rawAbility) {
  if (rawAbility == null) return "";
  if (typeof rawAbility === "string") return rawAbility;
  if (typeof rawAbility === "object") {
    const name = String(rawAbility.name || "").trim();
    const body = String(rawAbility.text || rawAbility.effect || "").trim();
    if (name && body) return `${name}：${body}`;
    return body || name;
  }
  return String(rawAbility);
}

function renderAbilityText(rawAbility) {
  const text = normalizeAbilityText(rawAbility);
  if (!text) return "";
  const colonIndex = text.search(/[：:]/);
  if (colonIndex < 0) return renderTextWithRuleLinks(text);
  const namePart = text.slice(0, colonIndex + 1);
  const descPart = text.slice(colonIndex + 1);
  return `<span class="ability-name">${displayHtml(namePart)}</span>${renderTextWithRuleLinks(descPart)}`;
}

function getUnitKeywordList(team, item) {
  if (Array.isArray(item?.keywords) && item.keywords.length) {
    return item.keywords.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  }
  const fallback = [];
  if (team?.name) fallback.push(String(team.name).replace("殺戮小隊", "").trim());
  if (item?.name) fallback.push(String(item.name).trim());
  return fallback.filter(Boolean);
}

function renderUnitKeywords(team, item) {
  const keywordLine = String(item?.keywords_line || "").trim();
  if (keywordLine) {
    return `<div class="unit-keywords">
              <div class="unit-keywords-line">${displayHtml(keywordLine)}</div>
            </div>`;
  }
  const keywords = getUnitKeywordList(team, item);
  if (!keywords.length) return "";
  return `<div class="unit-keywords">
            <div class="unit-keyword-chips">
              ${keywords.map((k) => `<span class="unit-keyword-chip">${displayHtml(k)}</span>`).join("")}
            </div>
          </div>`;
}

function renderItemImages(item) {
  const images = Array.isArray(item?.images) ? item.images : [];
  if (!images.length) return "";
  return `<div class="card">
            <h3>示意圖</h3>
            <div class="item-image-list">
              ${images
      .map((img) => {
        const src = typeof img === "string" ? img : img?.src || "";
        const alt = typeof img === "string" ? item?.name || "示意圖" : img?.alt || item?.name || "示意圖";
        if (!src) return "";
        return `<figure class="item-image-figure">
                  <img class="item-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />
                </figure>`;
      })
      .join("")}
            </div>
          </div>`;
}

function renderRuleModal() {
  if (!selectedWeaponRuleKey || !weaponRules.rules?.[selectedWeaponRuleKey]) return "";
  return `<div class="rule-modal-overlay" data-close-rule-modal="1">
            <div class="rule-modal" role="dialog" aria-modal="true" aria-label="武器規則說明">
              <div class="rule-modal-head">
                <h3>武器規則說明：${displayHtml(selectedWeaponRuleLabel || selectedWeaponRuleKey)}</h3>
                <button class="rule-modal-close" type="button" data-close-rule-modal="1">關閉</button>
              </div>
              <div class="rule-modal-body">
                <div class="text">${displayHtml(weaponRules.rules[selectedWeaponRuleKey])}</div>
              </div>
            </div>
          </div>`;
}

async function loadDoc() {
  const docCandidates = [
    "data/kt_teams_test.json",
    "./data/kt_teams_test.json",
    "/data/kt_teams_test.json",
    "data/teams.json",
    "./data/teams.json",
    "/data/teams.json"
  ];
  let lastErr = "";
  let loaded = false;
  for (const url of docCandidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastErr = `${url} -> HTTP ${res.status}`;
        continue;
      }
      doc = await res.json();
      loaded = true;
      break;
    } catch (err) {
      lastErr = `${url} -> ${err?.message || String(err)}`;
    }
  }
  if (!loaded) {
    doc = JSON.parse(document.getElementById("fallbackData").textContent);
    detailView.innerHTML = `<div class="meta">JSON 載入失敗：${escapeHtml(lastErr || "未知錯誤")}<br/>請確認你是用 Live Server 開啟，且路徑存在。</div>`;
  }
  // 暫時不載入爐心打撈者，保留原始 JSON 以便之後恢復。
  doc.teams = (doc.teams || []).filter((t) => t.id !== "hearthkyn_salvagers");
  if (!doc.teams.length) {
    if (!loaded) return;
    detailView.innerHTML = `<div class="meta">沒有可用資料，請確認 JSON 檔案存在且格式正確。</div>`;
    return;
  }
  currentTeamId = doc.teams[0].id;
  await loadWeaponRules();
  await loadUniversalEquipment();
  await loadEnglishDoc();
  renderTeams();
  renderAll();
}

function getTeam() {
  return doc.teams.find((t) => t.id === currentTeamId) || doc.teams[0];
}

function getEnglishTeam(teamId) {
  const team = (enDoc.teams || []).find((t) => t.id === teamId) || null;
  if (!team) return null;
  const pdf = String(team.pdf_url || "").toLowerCase();
  const hasEnglishSource = pdf.includes("/eng_") || pdf.includes("eng_");
  return hasEnglishSource ? team : null;
}

function getEnglishCompareData(team, item, tabKey) {
  const enTeam = getEnglishTeam(team.id);
  if (!enTeam || !item) return null;

  if (tabKey === "units") {
    const idx = (team.units || []).findIndex((x) => x.id === item.id);
    if (idx < 0) return null;
    const enUnit = (enTeam.units || [])[idx];
    if (!enUnit) return null;
    const abilities = Array.isArray(enUnit.abilities) ? enUnit.abilities.filter(Boolean) : [];
    if (!abilities.length) return null;
    return {
      title: `${enUnit.name || "Unit"} (EN)`,
      body: abilities.join("\n\n")
    };
  }

  if (["faction_rules", "strategic_ploys", "tactical_ploys", "equipment"].includes(tabKey)) {
    const idx = (team[tabKey] || []).findIndex((x) => x.id === item.id);
    if (idx < 0) return null;
    const enItem = (enTeam[tabKey] || [])[idx];
    if (!enItem || !enItem.effect) return null;
    return {
      title: `${enItem.name || "Item"} (EN)`,
      body: enItem.effect
    };
  }

  return null;
}

function getItems(team) {
  if (currentTab === "equipment") {
    const teamEquipment = Array.isArray(team?.equipment) ? team.equipment : [];
    const commonEquipment = Array.isArray(universalEquipment?.equipment) ? universalEquipment.equipment : [];
    const appendedCommon = commonEquipment.map((eq, index) => ({
      ...eq,
      id: `universal_equipment_${eq.id || index}`,
      name: `${eq.name || "通用裝備"}（通用）`
    }));
    return [...teamEquipment, ...appendedCommon];
  }
  return team[currentTab] || [];
}

function renderTeams() {
  teamSelect.innerHTML = doc.teams
    .map((t) => `<option value="${t.id}">${displayHtml(t.name)}</option>`)
    .join("");
  teamSelect.value = currentTeamId;
}

function listTitleByTab(key) {
  if (key === "units") return "特工清單";
  if (key === "faction_rules") return "陣營規則";
  if (key === "strategic_ploys") return "戰略計謀";
  if (key === "tactical_ploys") return "交戰計謀";
  if (key === "equipment") return "陣營裝備";
  return "特工清單";
}

function renderListPanelTitle() {
  if (!listPanelTitle) return;
  listPanelTitle.textContent = listTitleByTab(currentTab);
}

function renderPanelTitleActions() {
  const isUnitsTab = currentTab === "units";
  const isEquipmentTab = currentTab === "equipment";
  if (panelTitleActions) {
    panelTitleActions.hidden = !(isUnitsTab || isEquipmentTab);
    panelTitleActions.style.display = isUnitsTab || isEquipmentTab ? "inline-flex" : "none";
  }
  if (openSelectionRulesBtn) openSelectionRulesBtn.style.display = isUnitsTab ? "" : "none";
  if (unitFilterBtn) unitFilterBtn.style.display = isUnitsTab ? "" : "none";
  if (equipmentFilterBtn) equipmentFilterBtn.style.display = isEquipmentTab ? "" : "none";
  if (!isUnitsTab && selectionRulesOverlay && !selectionRulesOverlay.classList.contains("is-hidden")) {
    closeSelectionRulesOverlay();
  }
}

function renderItemList() {
  const team = getTeam();
  const items = getItems(team);
  const isCheckableTab = ["units", "strategic_ploys", "tactical_ploys", "equipment"].includes(currentTab);
  if (!items.length) {
    itemList.innerHTML = `<div class="meta">此分類尚無資料。</div>`;
    currentItemId = "";
    return;
  }
  if (!items.some((x) => x.id === currentItemId)) currentItemId = items[0].id;
  if (["units", "strategic_ploys", "tactical_ploys", "equipment", "faction_rules"].includes(currentTab)) {
    let visibleItems = items;
    if (currentTab === "units" && unitCheckedOnly) {
      visibleItems = items.filter((it) => {
        const key = listCheckKey(team.id, "units", it.id);
        return isUnitChecked(key);
      });
    } else if (currentTab === "equipment" && equipmentCheckedOnly) {
      visibleItems = items.filter((it) => {
        const key = listCheckKey(team.id, "equipment", it.id);
        return isEquipmentChecked(key);
      });
    }

    if (!visibleItems.length) {
      itemList.innerHTML = `<div class="meta">${currentTab === "units" && unitCheckedOnly
        ? "目前沒有已勾選單位。"
        : currentTab === "equipment" && equipmentCheckedOnly
          ? "目前沒有已勾選裝備。"
          : "此分類尚無資料。"
        }</div>`;
      currentItemId = "";
      return;
    }

    if (!visibleItems.some((x) => x.id === currentItemId)) currentItemId = visibleItems[0].id;

    itemList.innerHTML = visibleItems
      .map((it) => {
        const key = listCheckKey(team.id, currentTab, it.id);
        const isPloyTab = currentTab === "strategic_ploys" || currentTab === "tactical_ploys";
        const usedClass = isPloyTab && listChecks[key] ? "used" : "";
        const maxWounds = Number(it?.stats?.wounds ?? 0);
        const currentWounds = currentTab === "units" ? getCurrentWounds(team.id, it) : null;
        const checked = currentTab === "units"
          ? isUnitChecked(key)
          : currentTab === "equipment"
            ? isEquipmentChecked(key)
            : !!listChecks[key];
        const unitUncheckedClass = currentTab === "units" && !checked ? " is-unchecked-unit" : "";
        const equipmentUncheckedClass = currentTab === "equipment" && !checked ? " is-unchecked-equipment" : "";
        return `<div class="item-row${unitUncheckedClass}${equipmentUncheckedClass}">
                ${isCheckableTab ? `<input type="checkbox" class="list-check" data-key="${key}" ${checked ? "checked" : ""} />` : `<span></span>`}
                <div class="item-btn-wrap">
                  <button class="item-btn ${it.id === currentItemId ? "active" : ""} ${usedClass}${unitUncheckedClass}${equipmentUncheckedClass}" data-id="${it.id}">${displayHtml(it.name)}</button>
                </div>
                ${
                  currentTab === "units"
                    ? `<div class="wound-controls">
                        <button class="wound-btn" type="button" data-unit-id="${it.id}" data-delta="-1" data-max="${maxWounds}">-</button>
                        <span class="wound-value">${currentWounds}</span>
                        <button class="wound-btn" type="button" data-unit-id="${it.id}" data-delta="1" data-max="${maxWounds}">+</button>
                      </div>`
                    : ""
                }
              </div>`;
      })
      .join("");
    return;
  }
  itemList.innerHTML = items
    .map(
      (it) =>
        `<button class="item-btn ${it.id === currentItemId ? "active" : ""}" data-id="${it.id}">${it.name}</button>`
    )
    .join("");
}

function renderDetail() {
  const team = getTeam();
  const items = getItems(team);
  const item = items.find((x) => x.id === currentItemId);

  teamMeta.innerHTML = `隊伍：<strong>${displayHtml(team.name)}</strong>　|　PDF：<a href="${team.pdf_url}" target="_blank" rel="noreferrer">開啟來源</a>`;
  if (!item) {
    detailTitle.textContent = "內容";
    detailView.innerHTML = `<div class="meta">沒有可顯示內容</div>`;
    if (ruleModalRoot) ruleModalRoot.innerHTML = "";
    return;
  }

  detailTitle.textContent = convertForDisplay(`${team.name} / ${tabLabel(currentTab)} / ${item.name}`);
  const englishCompare = getEnglishCompareData(team, item, currentTab);

  const mainText = item.effect || "";
  const ruleModalHtml = renderRuleModal();
  if (ruleModalRoot) ruleModalRoot.innerHTML = ruleModalHtml;
  const shouldLinkRulesInMainText = ["faction_rules", "strategic_ploys", "tactical_ploys"].includes(currentTab);
  const mainTextHtml = shouldLinkRulesInMainText
    ? renderTextWithRuleLinks(mainText)
    : displayHtml(mainText || "（尚未填寫）");

  if (currentTab === "units") {
    const st = item.stats || {};
    const weapons = item.weapons || [];
    const abilities = item.abilities || [];
    detailView.innerHTML = `
            <div class="card unit-card unit-card-stats">
              <h3>${displayHtml(item.name)}</h3>
              <div class="stats">
                <div class="stat"><div class="k">APL</div><div class="v">${st.apl ?? "-"}</div></div>
                <div class="stat"><div class="k">移動</div><div class="v">${st.move ?? "-"}</div></div>
                <div class="stat"><div class="k">豁免</div><div class="v">${st.save ?? "-"}</div></div>
                <div class="stat"><div class="k">耐傷</div><div class="v">${st.wounds ?? "-"}</div></div>
              </div>
            </div>
            <div class="card unit-card card-weapon">
              <h3>武器</h3>
              ${weapons.length
        ? `<table class="weapon-table">
                      <thead>
                        <tr><th>勾選</th><th>名稱</th><th>攻擊</th><th>命中</th><th>傷害</th><th>規則</th></tr>
                      </thead>
                      <tbody>
                        ${weapons
          .map((w, idx) => {
            const key = weaponCheckKey(team.id, item.id, w.name || "-", idx);
            const checked = isWeaponChecked(key);
            const rulesHtml = checked ? renderWeaponRulesCell(w.rules) : "";
            return `<tr class="weapon-row ${checked ? "" : "is-unchecked"}">
                              <td>
                                <input
                                  type="checkbox"
                                  class="weapon-check"
                                  data-key="${key}"
                                  ${checked ? "checked" : ""}
                                />
                              </td>
                              <td>${displayHtml(w.name || "-")}</td>
                              <td>${w.atk ?? "-"}</td>
                              <td>${w.hit ?? "-"}</td>
                              <td>${w.dmg ?? "-"}</td>
                              <td>${rulesHtml}</td>
                            </tr>`;
          })
          .join("")}
                      </tbody>
                    </table>`
        : `<div class="meta">（此單位尚未填武器資料）</div>`
      }
            </div>
            <div class="card unit-card">
              <div class="card-head-with-action">
                <h3>能力（技能）</h3>
                ${englishCompare ? `<button type="button" class="inline-compare-btn" data-toggle-en-compare="1">英文版對照</button>` : ""}
              </div>
              ${abilities.length
        ? `<div class="text ability-text">${abilities.map((ab) => renderAbilityText(ab)).join("\n\n")}</div>`
        : `<div class="meta">（此單位尚未填能力資料）</div>`
      }
              ${englishCompare && showEnglishCompare
        ? `<div class="text compare-text"><strong>${escapeHtml(englishCompare.title)}</strong>\n\n${escapeHtml(englishCompare.body || "")}</div>`
        : ""}
            </div>
            <div class="card unit-card">
              <h3>關鍵字</h3>
              ${renderUnitKeywords(team, item)}
            </div>
          `;
    return;
  }

  detailView.innerHTML = `
          <div class="card">
            <div class="card-head-with-action">
              <h3>${displayHtml(item.name)}</h3>
              ${englishCompare ? `<button type="button" class="inline-compare-btn" data-toggle-en-compare="1">英文版對照</button>` : ""}
            </div>
            <div class="text">${mainTextHtml}</div>
            ${englishCompare && showEnglishCompare
      ? `<div class="text compare-text"><strong>${escapeHtml(englishCompare.title)}</strong>\n\n${escapeHtml(englishCompare.body || "")}</div>`
      : ""}
          </div>
          ${renderItemImages(item)}
        `;
}

function tabLabel(key) {
  if (key === "units") return "單位";
  if (key === "faction_rules") return "陣營規則";
  if (key === "strategic_ploys") return "戰略計謀";
  if (key === "tactical_ploys") return "交戰計謀";
  if (key === "equipment") return "陣營裝備";
  return key;
}

function renderAll() {
  renderListPanelTitle();
  renderPanelTitleActions();
  renderItemList();
  renderDetail();
}

function scrollToDetailOnMobile() {
  if (!detailPanel) return;
  if (window.matchMedia("(max-width: 980px)").matches) {
    detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

teamSelect.addEventListener("change", () => {
  currentTeamId = teamSelect.value;
  currentTab = "units";
  currentItemId = "";
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
  showEnglishCompare = false;
  [...tabs.querySelectorAll(".tab")].forEach((x) =>
    x.classList.toggle("active", x.dataset.key === "units")
  );
  renderAll();
  if (selectionRulesOverlay && !selectionRulesOverlay.classList.contains("is-hidden")) {
    renderSelectionRulesOverlay();
  }
});

tabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  currentTab = btn.dataset.key;
  currentItemId = "";
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
  showEnglishCompare = false;
  [...tabs.querySelectorAll(".tab")].forEach((x) => x.classList.toggle("active", x === btn));
  renderAll();
});

itemList.addEventListener("click", (e) => {
  const woundBtn = e.target.closest(".wound-btn");
  if (woundBtn) {
    const team = getTeam();
    const unitId = woundBtn.dataset.unitId;
    const delta = Number(woundBtn.dataset.delta || 0);
    const max = Number(woundBtn.dataset.max || 0);
    const unit = (team.units || []).find((u) => u.id === unitId);
    const key = unitWoundsKey(team.id, unitId);
    const current = Number.isFinite(Number(unitWounds[key])) ? Number(unitWounds[key]) : max;
    unitWounds[key] = Math.max(0, Math.min(max, current + delta));
    saveUnitWounds();
    if (delta !== 0) {
      const action = delta > 0 ? `加${Math.abs(delta)}耐傷` : `扣${Math.abs(delta)}耐傷`;
      addPlayLogEvent(`${unit?.name || unitId} ${action}`);
    }
    renderItemList();
    return;
  }

  const btn = e.target.closest(".item-btn");
  if (!btn) return;
  currentItemId = btn.dataset.id;
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
  showEnglishCompare = false;
  renderAll();
  scrollToDetailOnMobile();
});

itemList.addEventListener("change", (e) => {
  const input = e.target.closest(".list-check");
  if (!input) return;
  if (currentTab === "units") {
    // Persist only explicit unchecked for units.
    if (input.checked) {
      delete listChecks[input.dataset.key];
    } else {
      listChecks[input.dataset.key] = false;
    }
  } else if (currentTab === "equipment") {
    // Persist only explicit unchecked for equipment.
    if (input.checked) {
      delete listChecks[input.dataset.key];
    } else {
      listChecks[input.dataset.key] = false;
    }
  } else {
    listChecks[input.dataset.key] = input.checked;
  }
  saveListChecks();

  if (currentTab === "units") {
    const row = input.closest(".item-row");
    const btn = row?.querySelector(".item-btn");
    if (row) row.classList.toggle("is-unchecked-unit", !input.checked);
    if (btn) btn.classList.toggle("is-unchecked-unit", !input.checked);
    if (unitCheckedOnly) renderItemList();
  }

  if (currentTab === "equipment") {
    const row = input.closest(".item-row");
    const btn = row?.querySelector(".item-btn");
    if (row) row.classList.toggle("is-unchecked-equipment", !input.checked);
    if (btn) btn.classList.toggle("is-unchecked-equipment", !input.checked);
  }

  // 即時同步計謀的半透明狀態，不用等下一次重繪。
  if (currentTab === "strategic_ploys" || currentTab === "tactical_ploys") {
    const row = input.closest(".item-row");
    const btn = row?.querySelector(".item-btn");
    if (btn) btn.classList.toggle("used", input.checked);
  }

  if (input.checked) {
    const row = input.closest(".item-row");
    const itemName = row?.querySelector(".item-btn")?.textContent?.trim() || "";
    if (currentTab === "strategic_ploys") {
      addPlayLogEvent(`勾選戰略計謀-${itemName}`);
    } else if (currentTab === "tactical_ploys") {
      addPlayLogEvent(`勾選交戰計謀-${itemName}`);
    } else if (currentTab === "equipment") {
      addPlayLogEvent(`勾選陣營裝備-${itemName}`);
    }
  }
});

detailView.addEventListener("change", (e) => {
  const input = e.target.closest(".weapon-check");
  if (!input) return;
  // Persist only explicit unchecked; checked is the default state.
  if (input.checked) {
    delete weaponChecks[input.dataset.key];
  } else {
    weaponChecks[input.dataset.key] = false;
    selectedWeaponRuleKey = "";
    selectedWeaponRuleLabel = "";
  }
  saveWeaponChecks();
  renderDetail();
});

detailView.addEventListener("click", (e) => {
  const enCompareBtn = e.target.closest("[data-toggle-en-compare]");
  if (enCompareBtn) {
    showEnglishCompare = !showEnglishCompare;
    renderDetail();
    return;
  }

  const btn = e.target.closest(".rule-chip");
  if (btn) {
    selectedWeaponRuleKey = btn.dataset.ruleKey || "";
    selectedWeaponRuleLabel = btn.dataset.ruleLabel || selectedWeaponRuleKey;
    renderDetail();
    return;
  }

  if (e.target.closest(".rule-modal-close")) {
    selectedWeaponRuleKey = "";
    selectedWeaponRuleLabel = "";
    renderDetail();
    return;
  }

  const overlay = e.target.closest(".rule-modal-overlay");
  const modal = e.target.closest(".rule-modal");
  if (overlay && !modal) {
    selectedWeaponRuleKey = "";
    selectedWeaponRuleLabel = "";
    renderDetail();
  }
});

if (ruleModalRoot) {
  ruleModalRoot.addEventListener("click", (e) => {
    if (e.target.closest(".rule-modal-close")) {
      selectedWeaponRuleKey = "";
      selectedWeaponRuleLabel = "";
      renderDetail();
      return;
    }
    const overlay = e.target.closest(".rule-modal-overlay");
    const modal = e.target.closest(".rule-modal");
    if (overlay && !modal) {
      selectedWeaponRuleKey = "";
      selectedWeaponRuleLabel = "";
      renderDetail();
    }
  });
}

if (toggleScriptBtn) {
  toggleScriptBtn.addEventListener("click", () => {
    scriptMode = scriptMode === "zh-Hant" ? "zh-CN" : "zh-Hant";
    saveScriptMode();
    updateScriptButtonLabel();
    renderTeams();
    renderItemList();
    renderDetail();
    renderScoreUI();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (selectionRulesOverlay && !selectionRulesOverlay.classList.contains("is-hidden")) {
    closeSelectionRulesOverlay();
    return;
  }
  if (!scoreOverlay.classList.contains("is-hidden")) {
    closeScoreOverlay();
    return;
  }
  if (!selectedWeaponRuleKey) return;
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
  renderDetail();
});

fontSize.addEventListener("input", () => {
  document.documentElement.style.fontSize = `${fontSize.value}px`;
});

resetPloyChecksBtn.addEventListener("click", () => {
  clearRoundChecksForTeam(currentTeamId);
  renderAll();
});

resetWoundsBtn.addEventListener("click", () => {
  clearWoundsForTeam(currentTeamId);
  renderAll();
});

unitFilterBtn.addEventListener("click", () => {
  unitCheckedOnly = !unitCheckedOnly;
  saveUnitFilter();
  updateUnitFilterBtnLabel();
  if (currentTab === "units") {
    selectedWeaponRuleKey = "";
    selectedWeaponRuleLabel = "";
  }
  renderAll();
});

if (equipmentFilterBtn) {
  equipmentFilterBtn.addEventListener("click", () => {
    equipmentCheckedOnly = !equipmentCheckedOnly;
    saveEquipmentFilter();
    updateEquipmentFilterBtnLabel();
    if (currentTab === "equipment") {
      selectedWeaponRuleKey = "";
      selectedWeaponRuleLabel = "";
    }
    renderAll();
  });
}

openScoreBtn.addEventListener("click", () => {
  openScoreOverlay();
});

if (openSelectionRulesBtn) {
  openSelectionRulesBtn.addEventListener("click", () => {
    if (currentTab !== "units") return;
    openSelectionRulesOverlay();
  });
}

if (closeSelectionRulesBtn) {
  closeSelectionRulesBtn.addEventListener("click", () => {
    closeSelectionRulesOverlay();
  });
}

if (selectionRulesOverlay) {
  selectionRulesOverlay.addEventListener("click", (e) => {
    if (e.target === selectionRulesOverlay) closeSelectionRulesOverlay();
  });
}

closeScoreBtn.addEventListener("click", () => {
  closeScoreOverlay();
});

scoreOverlay.addEventListener("click", (e) => {
  if (e.target === scoreOverlay) closeScoreOverlay();
});

scoreOverlay.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-score-action='delta']");
  if (!btn) return;
  const field = btn.dataset.scoreField;
  const delta = Number(btn.dataset.delta || 0);
  if (!(field in scoreState)) return;
  const current = clampScoreValue(scoreState[field]);
  scoreState[field] = Math.max(0, current + delta);
  if (delta !== 0) {
    const match = String(field).match(/^(p[12])_(r[1-4])_(main|secondary|kill)$/);
    if (match) {
      const [, prefix, round, category] = match;
      const sign = delta > 0 ? "+" : "-";
      addPlayLogEvent(`調整VP-${round.toUpperCase()}${getVpCategoryLabel(category)} ${sign}${Math.abs(delta)}`, getPlayerName(prefix));
    }
  }
  saveScoreState();
  renderScoreUI();
});

scoreOverlay.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-score-action='set-bonus']");
  if (!btn) return;
  const player = btn.dataset.scorePlayer;
  const bonus = btn.dataset.scoreBonus;
  if (!["p1", "p2"].includes(player)) return;
  if (!["main", "secondary", "kill"].includes(bonus)) return;
  scoreState[`${player}_bonus`] = bonus;
  saveScoreState();
  renderScoreUI();
});

scoreP1Name.addEventListener("input", () => {
  scoreState.p1_name = scoreP1Name.value;
  saveScoreState();
});

scoreP2Name.addEventListener("input", () => {
  scoreState.p2_name = scoreP2Name.value;
  saveScoreState();
});

scoreNotes.addEventListener("input", () => {
  scoreState.notes = scoreNotes.value;
  saveScoreState();
});

scoreResetBtn.addEventListener("click", () => {
  scoreState = {
    p1_name: scoreState.p1_name || "",
    p1_bonus: scoreState.p1_bonus || "main",
    p1_r1_main: 0,
    p1_r1_secondary: 0,
    p1_r1_kill: 0,
    p1_r2_main: 0,
    p1_r2_secondary: 0,
    p1_r2_kill: 0,
    p1_r3_main: 0,
    p1_r3_secondary: 0,
    p1_r3_kill: 0,
    p1_r4_main: 0,
    p1_r4_secondary: 0,
    p1_r4_kill: 0,
    p2_name: scoreState.p2_name || "",
    p2_bonus: scoreState.p2_bonus || "main",
    p2_r1_main: 0,
    p2_r1_secondary: 0,
    p2_r1_kill: 0,
    p2_r2_main: 0,
    p2_r2_secondary: 0,
    p2_r2_kill: 0,
    p2_r3_main: 0,
    p2_r3_secondary: 0,
    p2_r3_kill: 0,
    p2_r4_main: 0,
    p2_r4_secondary: 0,
    p2_r4_kill: 0,
    play_log: [],
    notes: ""
  };
  saveScoreState();
  renderScoreUI();
});

if (scoreExportBtn) {
  scoreExportBtn.addEventListener("click", () => {
    exportScoreA4Image();
  });
}

if (scoreResetLogBtn) {
  scoreResetLogBtn.addEventListener("click", () => {
    scoreState.play_log = [];
    saveScoreState();
    renderPlayLogUI();
  });
}

if (scoreResetAllBtn) {
  scoreResetAllBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
}

if (scoreTimerStartBtn) {
  scoreTimerStartBtn.addEventListener("click", () => {
    startTimer();
  });
}

if (scoreTimerPauseBtn) {
  scoreTimerPauseBtn.addEventListener("click", () => {
    togglePauseTimer();
  });
}

if (scoreTimerEndBtn) {
  scoreTimerEndBtn.addEventListener("click", () => {
    endTimer();
  });
}

loadScriptMode();
loadWeaponChecks();
loadListChecks();
loadUnitFilter();
loadEquipmentFilter();
loadUnitWounds();
loadScoreState();
updateUnitFilterBtnLabel();
updateEquipmentFilterBtnLabel();
loadDoc();

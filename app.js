const teamSelect = document.getElementById("teamSelect");
const fontSize = document.getElementById("fontSize");
const teamMeta = document.getElementById("teamMeta");
const tabs = document.getElementById("tabs");
const itemList = document.getElementById("itemList");
const detailTitle = document.getElementById("detailTitle");
const detailView = document.getElementById("detailView");
const detailPanel = document.getElementById("detailPanel");
let ruleModalRoot = document.getElementById("ruleModalRoot");
if (!ruleModalRoot) {
  ruleModalRoot = document.createElement("div");
  ruleModalRoot.id = "ruleModalRoot";
  document.body.appendChild(ruleModalRoot);
}
const resetPloyChecksBtn = document.getElementById("resetPloyChecksBtn");
const unitFilterBtn = document.getElementById("unitFilterBtn");
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
let currentTeamId = "";
let currentTab = "units";
let currentItemId = "";
let weaponChecks = {};
let listChecks = {};
let unitWounds = {};
let weaponRules = { rules: {} };
let selectedWeaponRuleKey = "";
let selectedWeaponRuleLabel = "";
let unitCheckedOnly = false;
let timerRunning = false;
let timerHasStarted = false;
let timerElapsedMs = 0;
let timerStartAt = 0;
let timerIntervalId = null;
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
const UNIT_WOUNDS_KEY = "kt_unit_wounds_v1";
const SCORE_STATE_KEY = "kt_score_state_v1";

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

function listCheckKey(teamId, tabKey, itemId) {
  return `${teamId}__${tabKey}__${itemId}`;
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
    `${teamId}__tactical_ploys__`,
    `${teamId}__equipment__`
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

function getRuleKey(token) {
  const t = normalizeRuleToken(token);
  const keys = [
    "关键穿刺", "穿刺", "精准", "平衡", "爆炸", "残暴", "无休", "毁灭", "重型",
    "过热", "致命", "有限", "重击", "范围", "毫不留情", "撕裂", "集中", "追踪",
    "严重", "震荡", "安静", "晕眩", "洪流", "灵能", "毒素", "剧毒", "乱射", "隐匿位置"
  ];
  return keys.find((k) => t.startsWith(k)) || "";
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
  if (!tokens.length) return escapeHtml(text);
  return `<div class="rule-chips">${tokens.map((token) => {
    const key = getRuleKey(token);
    if (!key || !weaponRules.rules?.[key]) return `<span>${escapeHtml(token)}</span>`;
    const active = key === selectedWeaponRuleKey ? "active" : "";
    return `<button type="button" class="rule-chip ${active}" data-rule-key="${escapeHtml(key)}" data-rule-label="${escapeHtml(token)}">${escapeHtml(token)}</button>`;
  }).join("")}</div>`;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLinkableRuleKeys() {
  return Object.keys(weaponRules.rules || {})
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
  if (!keys.length) return escapeHtml(text);
  const regex = new RegExp(`(${keys.map(escapeRegExp).join("|")})`, "g");
  let out = "";
  let last = 0;
  let match = regex.exec(text);
  while (match) {
    const idx = match.index;
    const key = match[0];
    out += escapeHtml(text.slice(last, idx));
    if (!weaponRules.rules?.[key] || shouldSkipRuleLink(text, key, idx)) {
      out += escapeHtml(key);
    } else {
      const active = key === selectedWeaponRuleKey ? "active" : "";
      out += `<button type="button" class="rule-chip ${active}" data-rule-key="${escapeHtml(key)}" data-rule-label="${escapeHtml(key)}">${escapeHtml(key)}</button>`;
    }
    last = idx + key.length;
    match = regex.exec(text);
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function renderAbilityText(rawText) {
  const text = String(rawText ?? "");
  if (!text) return "";
  const colonIndex = text.search(/[：:]/);
  if (colonIndex < 0) return renderTextWithRuleLinks(text);
  const namePart = text.slice(0, colonIndex + 1);
  const descPart = text.slice(colonIndex + 1);
  return `<span class="ability-name">${escapeHtml(namePart)}</span>${renderTextWithRuleLinks(descPart)}`;
}

function renderRuleModal() {
  if (!selectedWeaponRuleKey || !weaponRules.rules?.[selectedWeaponRuleKey]) return "";
  return `<div class="rule-modal-overlay" data-close-rule-modal="1">
            <div class="rule-modal" role="dialog" aria-modal="true" aria-label="武器規則說明">
              <div class="rule-modal-head">
                <h3>武器規則說明：${escapeHtml(selectedWeaponRuleLabel || selectedWeaponRuleKey)}</h3>
                <button class="rule-modal-close" type="button" data-close-rule-modal="1">關閉</button>
              </div>
              <div class="rule-modal-body">
                <div class="text">${escapeHtml(weaponRules.rules[selectedWeaponRuleKey])}</div>
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
  if (!doc.teams.length) {
    if (!loaded) return;
    detailView.innerHTML = `<div class="meta">沒有可用資料，請確認 JSON 檔案存在且格式正確。</div>`;
    return;
  }
  currentTeamId = doc.teams[0].id;
  await loadWeaponRules();
  renderTeams();
  renderAll();
}

function getTeam() {
  return doc.teams.find((t) => t.id === currentTeamId) || doc.teams[0];
}

function getItems(team) {
  return team[currentTab] || [];
}

function renderTeams() {
  teamSelect.innerHTML = doc.teams
    .map((t) => `<option value="${t.id}">${t.name}</option>`)
    .join("");
  teamSelect.value = currentTeamId;
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
        return !!listChecks[key];
      });
    }

    if (!visibleItems.length) {
      itemList.innerHTML = `<div class="meta">${currentTab === "units" && unitCheckedOnly ? "目前沒有已勾選單位。" : "此分類尚無資料。"
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
        return `<div class="item-row">
                ${isCheckableTab ? `<input type="checkbox" class="list-check" data-key="${key}" ${listChecks[key] ? "checked" : ""} />` : `<span></span>`}
                <button class="item-btn ${it.id === currentItemId ? "active" : ""} ${usedClass}" data-id="${it.id}">${it.name}</button>
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

  teamMeta.innerHTML = `隊伍：<strong>${team.name}</strong>　|　PDF：<a href="${team.pdf_url}" target="_blank" rel="noreferrer">開啟來源</a>`;
  if (!item) {
    detailTitle.textContent = "內容";
    detailView.innerHTML = `<div class="meta">沒有可顯示內容</div>`;
    if (ruleModalRoot) ruleModalRoot.innerHTML = "";
    return;
  }

  detailTitle.textContent = `${team.name} / ${tabLabel(currentTab)} / ${item.name}`;

  const mainText = item.summary || item.effect || "";
  const ruleModalHtml = renderRuleModal();
  if (ruleModalRoot) ruleModalRoot.innerHTML = ruleModalHtml;
  const shouldLinkRulesInMainText = ["faction_rules", "strategic_ploys", "tactical_ploys"].includes(currentTab);
  const mainTextHtml = shouldLinkRulesInMainText
    ? renderTextWithRuleLinks(mainText)
    : escapeHtml(mainText || "（尚未填寫）");

  if (currentTab === "units") {
    const st = item.stats || {};
    const weapons = item.weapons || [];
    const abilities = item.abilities || [];
    detailView.innerHTML = `
            <div class="card">
              <h3>${item.name}</h3>
              <div class="stats">
                <div class="stat"><div class="k">APL</div><div class="v">${st.apl ?? "-"}</div></div>
                <div class="stat"><div class="k">移動</div><div class="v">${st.move ?? "-"}</div></div>
                <div class="stat"><div class="k">豁免</div><div class="v">${st.save ?? "-"}</div></div>
                <div class="stat"><div class="k">耐傷</div><div class="v">${st.wounds ?? "-"}</div></div>
              </div>
            </div>
            <div class="card">
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
            return `<tr>
                              <td>
                                <input
                                  type="checkbox"
                                  class="weapon-check"
                                  data-key="${key}"
                                  ${weaponChecks[key] ? "checked" : ""}
                                />
                              </td>
                              <td>${w.name || "-"}</td>
                              <td>${w.atk ?? "-"}</td>
                              <td>${w.hit ?? "-"}</td>
                              <td>${w.dmg ?? "-"}</td>
                              <td>${renderWeaponRulesCell(w.rules)}</td>
                            </tr>`;
          })
          .join("")}
                      </tbody>
                    </table>`
        : `<div class="meta">（此單位尚未填武器資料）</div>`
      }
            </div>
            <div class="card">
              <h3>能力（技能）</h3>
              ${abilities.length
        ? `<div class="text ability-text">${abilities.map((ab) => renderAbilityText(ab)).join("\n\n")}</div>`
        : `<div class="meta">（此單位尚未填能力資料）</div>`
      }
            </div>
            <div class="card">
              <h3>隊伍備註</h3>
              <div class="text">${team.notes || "（無）"}</div>
            </div>
          `;
    return;
  }

  detailView.innerHTML = `
          <div class="card">
            <h3>${item.name}</h3>
            <div class="text">${mainTextHtml}</div>
          </div>
          <div class="card">
            <h3>隊伍備註</h3>
            <div class="text">${team.notes || "（無）"}</div>
          </div>
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
  [...tabs.querySelectorAll(".tab")].forEach((x) =>
    x.classList.toggle("active", x.dataset.key === "units")
  );
  renderAll();
});

tabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  currentTab = btn.dataset.key;
  currentItemId = "";
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
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
  renderAll();
  scrollToDetailOnMobile();
});

itemList.addEventListener("change", (e) => {
  const input = e.target.closest(".list-check");
  if (!input) return;
  listChecks[input.dataset.key] = input.checked;
  saveListChecks();

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
  weaponChecks[input.dataset.key] = input.checked;
  saveWeaponChecks();
});

detailView.addEventListener("click", (e) => {
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

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
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

openScoreBtn.addEventListener("click", () => {
  openScoreOverlay();
});

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

loadWeaponChecks();
loadListChecks();
loadUnitFilter();
loadUnitWounds();
loadScoreState();
updateUnitFilterBtnLabel();
loadDoc();

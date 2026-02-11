const teamSelect = document.getElementById("teamSelect");
const fontSize = document.getElementById("fontSize");
const teamMeta = document.getElementById("teamMeta");
const tabs = document.getElementById("tabs");
const itemList = document.getElementById("itemList");
const detailTitle = document.getElementById("detailTitle");
const detailView = document.getElementById("detailView");
const resetPloyChecksBtn = document.getElementById("resetPloyChecksBtn");
const unitFilterBtn = document.getElementById("unitFilterBtn");
const resetWoundsBtn = document.getElementById("resetWoundsBtn");

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

const WEAPON_CHECKS_KEY = "kt_weapon_checks_v1";
const LIST_CHECKS_KEY = "kt_list_checks_v1";
const UNIT_FILTER_KEY = "kt_units_checked_only_v1";
const UNIT_WOUNDS_KEY = "kt_unit_wounds_v1";

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
    return `<button class="rule-chip ${active}" data-rule-key="${escapeHtml(key)}" data-rule-label="${escapeHtml(token)}">${escapeHtml(token)}</button>`;
  }).join("")}</div>`;
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
  if (!items.length) {
    itemList.innerHTML = `<div class="meta">此分類尚無資料。</div>`;
    currentItemId = "";
    return;
  }
  if (!items.some((x) => x.id === currentItemId)) currentItemId = items[0].id;
  if (["units", "strategic_ploys", "tactical_ploys", "equipment"].includes(currentTab)) {
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
                <input type="checkbox" class="list-check" data-key="${key}" ${listChecks[key] ? "checked" : ""} />
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
    return;
  }

  detailTitle.textContent = `${team.name} / ${tabLabel(currentTab)} / ${item.name}`;

  const mainText = item.summary || item.effect || "";

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
        ? `<table>
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
        ? `<div class="text">${abilities.join("\n\n")}</div>`
        : `<div class="meta">（此單位尚未填能力資料）</div>`
      }
            </div>
            <div class="card">
              <h3>隊伍備註</h3>
              <div class="text">${team.notes || "（無）"}</div>
            </div>
            ${selectedWeaponRuleKey && weaponRules.rules?.[selectedWeaponRuleKey]
        ? `<div class="rule-modal-overlay" data-close-rule-modal="1">
                    <div class="rule-modal" role="dialog" aria-modal="true" aria-label="武器規則說明">
                      <div class="rule-modal-head">
                        <h3>武器規則說明：${escapeHtml(selectedWeaponRuleLabel || selectedWeaponRuleKey)}</h3>
                        <button class="rule-modal-close" type="button" data-close-rule-modal="1">關閉</button>
                      </div>
                      <div class="rule-modal-body">
                        <div class="text">${escapeHtml(weaponRules.rules[selectedWeaponRuleKey])}</div>
                      </div>
                    </div>
                  </div>`
        : ""
      }
          `;
    return;
  }

  detailView.innerHTML = `
          <div class="card">
            <h3>${item.name}</h3>
            <div class="text">${mainText || "（尚未填寫）"}</div>
          </div>
          <div class="card">
            <h3>隊伍備註</h3>
            <div class="text">${team.notes || "（無）"}</div>
          </div>
        `;
}

function tabLabel(key) {
  if (key === "units") return "單位";
  if (key === "strategic_ploys") return "戰略計謀";
  if (key === "tactical_ploys") return "交戰計謀";
  if (key === "equipment") return "陣營裝備";
  return key;
}

function renderAll() {
  renderItemList();
  renderDetail();
}

teamSelect.addEventListener("change", () => {
  currentTeamId = teamSelect.value;
  currentItemId = "";
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
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
    const key = unitWoundsKey(team.id, unitId);
    const current = Number.isFinite(Number(unitWounds[key])) ? Number(unitWounds[key]) : max;
    unitWounds[key] = Math.max(0, Math.min(max, current + delta));
    saveUnitWounds();
    renderItemList();
    return;
  }

  const btn = e.target.closest(".item-btn");
  if (!btn) return;
  currentItemId = btn.dataset.id;
  selectedWeaponRuleKey = "";
  selectedWeaponRuleLabel = "";
  renderAll();
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

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
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

loadWeaponChecks();
loadListChecks();
loadUnitFilter();
loadUnitWounds();
updateUnitFilterBtnLabel();
loadDoc();

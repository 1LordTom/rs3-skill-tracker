const usernames = ["Two Ts 2", "Two Ts 1"];
const baseUrl =
  "https://corsproxy.io/?https://apps.runescape.com/runemetrics/profile/profile?user=";

const skillMap = [
  "Attack","Defence","Strength","Constitution","Ranged","Prayer",
  "Magic","Cooking","Woodcutting","Fletching","Fishing","Firemaking",
  "Crafting","Smithing","Mining","Herblore","Agility","Thieving",
  "Slayer","Farming","Runecrafting","Hunter","Construction","Summoning",
  "Dungeoneering","Divination","Invention","Archaeology","Necromancy"
];

// --- manual‑refresh cooldown ---
let isCooldown = false;
const cooldownTime = 60 * 1000; // 1 minute

// Fetch both levels & XP
async function fetchData(username) {
  const response = await fetch(baseUrl + encodeURIComponent(username));
  const data = await response.json();
  if (!data || !Array.isArray(data.skillvalues)) {
    throw new Error(`Invalid data for ${username}`);
  }

  const levels = {};
  const xp = {};
  for (const skill of data.skillvalues) {
    const name = skillMap[skill.id] || `Skill ${skill.id}`;
    levels[name] = skill.level;
    xp[name]     = skill.xp;    // XP field from API
  }
  return { levels, xp };
}

// returns [absDiff, whoIsAhead]
function getDifference(a, b) {
  const diff = a - b;
  const who = diff === 0
    ? "Equal"
    : diff > 0
      ? usernames[0]
      : usernames[1];
  return [Math.abs(diff), who];
}

async function update() {
  try {
    // 1) fetch both users
    const [d1, d2] = await Promise.all(usernames.map(fetchData));
    const user1 = d1.levels, user2 = d2.levels;
    const xp1   = d1.xp,    xp2   = d2.xp;

    // 2) clear table
    const tbody = document.querySelector("#skill-table tbody");
    tbody.innerHTML = "";

    // 3) build skill rows & accumulate totals
    let totalLvl1 = 0, totalLvl2 = 0;
    let totalXp1  = 0, totalXp2  = 0;

    for (const skill of Object.keys(user1)) {
      const lvl1 = user1[skill] || 0;
      const lvl2 = user2[skill] || 0;
      const [lvlDiff, lvlWho] = getDifference(lvl1, lvl2);

      const xpVal1 = xp1[skill] || 0;
      const xpVal2 = xp2[skill] || 0;

      totalLvl1 += lvl1;
      totalLvl2 += lvl2;
      totalXp1  += xpVal1;
      totalXp2  += xpVal2;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${skill}</td>
        <td>${lvl1}</td>
        <td>${lvl2}</td>
        <td>${lvlDiff}</td>
        <td class="${lvlWho === usernames[0] ? 'better'
                 : lvlWho === usernames[1] ? 'worse' : ''}">
          ${lvlWho}
        </td>
      `;
      tbody.appendChild(tr);
    }

    // 4) Total Level summary row
    const [lvlTotDiff, lvlTotWho] = getDifference(totalLvl1, totalLvl2);
    const lvlSummary = document.createElement("tr");
    lvlSummary.innerHTML = `
      <td><strong>Total Level</strong></td>
      <td><strong>${totalLvl1}</strong></td>
      <td><strong>${totalLvl2}</strong></td>
      <td><strong>${lvlTotDiff}</strong></td>
      <td class="${lvlTotWho === usernames[0] ? 'better'
               : lvlTotWho === usernames[1] ? 'worse' : ''}">
        <strong>${lvlTotWho}</strong>
      </td>
    `;
    tbody.appendChild(lvlSummary);

    // 5) Total XP summary row
    const [xpTotDiff, xpTotWho] = getDifference(totalXp1, totalXp2);
    const xpSummary = document.createElement("tr");
    xpSummary.innerHTML = `
      <td><strong>Total XP</strong></td>
      <td><strong>${totalXp1.toLocaleString()}</strong></td>
      <td><strong>${totalXp2.toLocaleString()}</strong></td>
      <td><strong>${xpTotDiff.toLocaleString()}</strong></td>
      <td class="${xpTotWho === usernames[0] ? 'better'
               : xpTotWho === usernames[1] ? 'worse' : ''}">
        <strong>${xpTotWho}</strong>
      </td>
    `;
    tbody.appendChild(xpSummary);

    // 6) update timestamp
    document.getElementById("last-updated").textContent =
      `Last updated: ${new Date().toLocaleString()}`;

  } catch (err) {
    console.error("Failed to update table:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh");
  if (refreshBtn) {
    // replace direct update() with cooldown logic
    refreshBtn.addEventListener("click", () => {
      if (isCooldown) return;
      isCooldown = true;
      refreshBtn.disabled = true;
      update()
        .finally(() => {
          setTimeout(() => {
            isCooldown = false;
            refreshBtn.disabled = false;
          }, cooldownTime);
        });
    });
  }

  // initial load & auto‑hourly schedule
  update();
  const now = new Date();
  const msUntilNextHour =
    (60 - now.getMinutes()) * 60 * 1000 -
    now.getSeconds() * 1000;
  setTimeout(() => {
    update();
    setInterval(update, 60 * 60 * 1000);
  }, msUntilNextHour);
});


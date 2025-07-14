const usernames = ["Two Ts 2", "Two Ts 1"];
const baseUrl =
  "https://corsproxy.io/?https://apps.runescape.com/runemetrics/profile/profile?user=";

const skillMap = [
  "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer",
  "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking",
  "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving",
  "Slayer", "Farming", "Runecrafting", "Hunter", "Construction", "Summoning",
  "Dungeoneering", "Divination", "Invention", "Archaeology", "Necromancy"
];

// new: manual‑refresh cooldown
let isCooldown = false;
const cooldownTime = 60 * 1000; // 1 minute

// now fetch both levels **and** xp
async function fetchData(username) {
  const response = await fetch(baseUrl + encodeURIComponent(username));
  const data = await response.json();

  if (!data || !Array.isArray(data.skillvalues)) {
    throw new Error(`Invalid data for ${username}`);
  }

  const skills = {};
  const xpVals = {};   // new

  for (const skill of data.skillvalues) {
    const name = skillMap[skill.id] || `Skill ${skill.id}`;
    skills[name] = skill.level;
    xpVals[name]   = skill.xp;      // collect XP
  }

  return { skills, xpVals };
}

// return [absoluteDiff, whoIsAhead], with tie = "Equal"
function getDifference(a, b) {
  const diff = a - b;
  if (diff === 0) return [0, "Equal"];
  const who = diff > 0 ? usernames[0] : usernames[1];
  return [Math.abs(diff), who];
}

async function update() {
  try {
    // fetch both users
    const [d1, d2] = await Promise.all(usernames.map(fetchData));
    const user1 = d1.skills, user2 = d2.skills;
    const xp1   = d1.xpVals, xp2   = d2.xpVals;

    const tbody = document.querySelector("#skill-table tbody");
    tbody.innerHTML = "";

    let totalLvl1 = 0, totalLvl2 = 0;
    let totalXp1  = 0, totalXp2  = 0;

    // per-skill rows
    Object.keys(user1).forEach(skill => {
      const v1 = user1[skill] || 0;
      const v2 = user2[skill] || 0;
      const [lvlDiff, lvlWho] = getDifference(v1, v2);

      const xpVal1 = xp1[skill] || 0;
      const xpVal2 = xp2[skill] || 0;

      totalLvl1 += v1;
      totalLvl2 += v2;
      totalXp1  += xpVal1;
      totalXp2  += xpVal2;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${skill}</strong></td>
        <td>${v1}</td>
        <td>${v2}</td>
        <td>${lvlDiff}</td>
        <td class="${
          lvlWho === usernames[0]
            ? "better"
            : lvlWho === usernames[1]
              ? "worse"
              : "equal"
        }">${lvlWho}</td>
      `;
      tbody.appendChild(row);
    });

    // Total Level summary
    {
      const [diff, who] = getDifference(totalLvl1, totalLvl2);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>Total Level</strong></td>
        <td>${totalLvl1}</td>
        <td>${totalLvl2}</td>
        <td>${diff}</td>
        <td class="${
          who === usernames[0]
            ? "better"
            : who === usernames[1]
              ? "worse"
              : "equal"
        }">${who}</td>
      `;
      tbody.appendChild(tr);
    }

    // Total XP summary (divide raw XP by 10 to match your units)
    {
      const adj1 = Math.round(totalXp1 / 10);
      const adj2 = Math.round(totalXp2 / 10);
      const [diff, who] = getDifference(adj1, adj2);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>Total XP</strong></td>
        <td>${adj1.toLocaleString()}</td>
        <td>${adj2.toLocaleString()}</td>
        <td>${diff.toLocaleString()}</td>
        <td class="${
          who === usernames[0]
            ? "better"
            : who === usernames[1]
              ? "worse"
              : "equal"
        }">${who}</td>
      `;
      tbody.appendChild(tr);
    }

    // update last-updated timestamp
    document.getElementById("last-updated").textContent =
      `Last updated: ${new Date().toLocaleString()}`;
  } catch (err) {
    console.error("Failed to update table:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (isCooldown) return;       // enforce cooldown
      isCooldown = true;
      refreshBtn.disabled = true;
      update().finally(() => {
        setTimeout(() => {
          isCooldown = false;
          refreshBtn.disabled = false;
        }, cooldownTime);
      });
    });
  }
  update();  // initial load
});

// hourly auto‑refresh
const now = new Date();
const msUntilNextHour =
  (60 - now.getMinutes()) * 60 * 1000 -
  now.getSeconds() * 1000;
setTimeout(() => {
  update();
  setInterval(update, 60 * 60 * 1000);
}, msUntilNextHour);

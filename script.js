const usernames = ["Two Ts 2", "Two Ts 1"];
const baseUrl = "https://corsproxy.io/?https://apps.runescape.com/runemetrics/profile/profile?user=";

const skillMap = [
  "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer",
  "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking",
  "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving",
  "Slayer", "Farming", "Runecrafting", "Hunter", "Construction", "Summoning",
  "Dungeoneering", "Divination", "Invention", "Archaeology", "Necromancy"
];

async function fetchData(username) {
  const response = await fetch(baseUrl + encodeURIComponent(username));
  const data = await response.json();

  if (!data || !Array.isArray(data.skillvalues)) {
    throw new Error(`Invalid data for ${username}`);
  }

  const skills = {};
  for (const skill of data.skillvalues) {
    const name = skillMap[skill.id] || `Skill ${skill.id}`;
    skills[name] = skill.level;
  }

  return skills;
}

function getDifference(a, b) {
  const diff = a - b;
  const who = diff === 0 ? "Equal" : diff > 0 ? usernames[0] : usernames[1];
  return [Math.abs(diff), who];
}

async function update() {
  try {
    const [user1, user2] = await Promise.all(usernames.map(fetchData));
    const tableBody = document.querySelector("#skill-table tbody");
    tableBody.innerHTML = "";

    Object.keys(user1).forEach(skill => {
      const row = document.createElement("tr");
      const val1 = user1[skill] || 0;
      const val2 = user2[skill] || 0;
      const [diff, who] = getDifference(val1, val2);

      row.innerHTML = `
        <td>${skill}</td>
        <td>${val1}</td>
        <td>${val2}</td>
        <td>${diff}</td>
        <td class="${who === usernames[0] ? 'better' : who === usernames[1] ? 'worse' : ''}">${who}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to update table:", err);
  }
}

// Manual refresh button
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", update);
  } else {
    console.warn("Refresh button not found");
  }

  update(); // Initial call
});

// Hourly refresh at start of each hour
const now = new Date();
const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
setTimeout(() => {
  update();
  setInterval(update, 60 * 60 * 1000); // every hour
}, msUntilNextHour);

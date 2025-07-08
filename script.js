const proxy = "https://api.allorigins.win/raw?url=";
const user1 = "Two%20Ts%201";
const user2 = "Two%20Ts%202";

const skillOrder = [
  "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting",
  "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving",
  "Slayer", "Farming", "Runecrafting", "Hunter", "Construction", "Summoning", "Dungeoneering", "Divination",
  "Invention", "Archaeology", "Necromancy"
];

async function fetchData(username) {
  const url = `${proxy}https://apps.runescape.com/runemetrics/profile/profile?user=${username}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${username}`);
  const data = await response.json();
  return data.skills.reduce((acc, skill) => {
    acc[skill.name] = skill.level;
    return acc;
  }, {});
}

function generateTable(data1, data2) {
  const tbody = document.getElementById("skill-table-body");
  tbody.innerHTML = "";

  skillOrder.forEach(skill => {
    const level1 = data1[skill] || 0;
    const level2 = data2[skill] || 0;
    const diff = level2 - level1;
    const ahead = diff > 0 ? "Two Ts 2" : diff < 0 ? "Two Ts 1" : "Equal";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${skill}</td>
      <td class="${level2 > level1 ? 'better' : level2 < level1 ? 'worse' : ''}">${level2}</td>
      <td class="${level1 > level2 ? 'better' : level1 < level2 ? 'worse' : ''}">${level1}</td>
      <td>${Math.abs(diff)}</td>
      <td>${ahead}</td>
    `;
    tbody.appendChild(row);
  });
}

async function update() {
  try {
    const [data1, data2] = await Promise.all([fetchData(user1), fetchData(user2)]);
    generateTable(data1, data2);
  } catch (err) {
    console.error(err);
    document.getElementById("skill-table-body").innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
  }
}

function scheduleHourlyRefresh() {
  const now = new Date();
  const delay = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
  setTimeout(() => {
    update();
    setInterval(update, 60 * 60 * 1000); // every hour
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  update();
  document.getElementById("manual-refresh").addEventListener("click", update);
  scheduleHourlyRefresh();
});
async function fetchData(username) {
    const response = await fetch(proxy + encodeURIComponent(baseUrl + username));
    const data = await response.json();

    if (!data.skillvalues) {
        throw new Error(`Missing skillvalues for ${username}: ${JSON.stringify(data)}`);
    }

    return data.skillvalues.reduce((acc, skill) => {
        acc[skill.name] = skill.level;
        return acc;
    }, {});
}


const usernames = ["Two Ts 2", "Two Ts 1"];
const proxy = "https://corsproxy.io/?";
const baseUrl = "https://apps.runescape.com/runemetrics/profile/profile?user=";

const skillMap = [
  "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer", "Magic",
  "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting",
  "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming",
  "Runecrafting", "Hunter", "Construction", "Summoning", "Dungeoneering",
  "Divination", "Invention", "Archaeology", "Necromancy"
];

async function fetchData(username) {
  const response = await fetch(proxy + encodeURIComponent(baseUrl + username));
  const data = await response.json();

  return data.skillvalues.reduce((acc, skill) => {
    const name = skillMap[skill.id] || `Skill ${skill.id}`;
    acc[name] = skill.level;
    return acc;
  }, {});
}

function getDifference(a, b) {
  const diff = a - b;
  const who = diff === 0 ? "Equal" : diff > 0 ? usernames[0] : usernames[1];
  return [Math.abs(diff), who];
}

async function updateTable() {
  try {
    const [user1Data, user2Data] = await Promise.all(usernames.map(fetchData));
    const tableBody = document.querySelector("#skill-table tbody");

    tableBody.innerHTML = "";

    Object.keys(user1Data).forEach(skill => {
      const user1 = user1Data[skill] || 0;
      const user2 = user2Data[skill] || 0;
      const [diff, who] = getDifference(user1, user2);

      const row = document.createElement("tr");
      if (user1 > user2) row.classList.add("better");
      else if (user1 < user2) row.classList.add("worse");

      row.innerHTML = `
        <td>${skill}</td>
        <td>${user1}</td>
        <td>${user2}</td>
        <td>${diff}</td>
        <td>${who}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Update failed:", err);
  }
}

// Manual refresh
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refresh-btn").addEventListener("click", updateTable);
  updateTable();

  // Refresh every hour on the hour
  const msUntilNextHour = 3600000 - (Date.now() % 3600000);
  setTimeout(() => {
    updateTable();
    setInterval(updateTable, 3600000); // Every hour
  }, msUntilNextHour);
});

const usernames = ["Two Ts 2", "Two Ts 1"];
const proxy = "https://corsproxy.io/?";
const baseUrl = "https://apps.runescape.com/runemetrics/profile/profile?user=";

async function fetchData(username) {
  try {
    const url = proxy + encodeURIComponent(baseUrl + username);
    const response = await fetch(url);
    const data = await response.json();

    if (!data.skillvalues || !Array.isArray(data.skillvalues)) {
      console.warn(`Invalid skill data for ${username}`, data);
      return {};
    }

    return data.skillvalues.reduce((acc, skill) => {
      acc[skill.name] = skill.level;
      return acc;
    }, {});
  } catch (err) {
    console.error("Failed to fetch", username, err);
    return {};
  }
}

function getDifference(a, b) {
  const diff = a - b;
  const who = diff === 0 ? "Equal" : diff > 0 ? "Two Ts 2" : "Two Ts 1";
  return [Math.abs(diff), who];
}

async function updateTable() {
  const [userA, userB] = await Promise.all(usernames.map(fetchData));
  const tableBody = document.querySelector("#skill-table tbody");
  tableBody.innerHTML = "";

  const skills = new Set([...Object.keys(userA), ...Object.keys(userB)]);
  for (const skill of skills) {
    const levelA = userA[skill] ?? 0;
    const levelB = userB[skill] ?? 0;
    const [diff, who] = getDifference(levelA, levelB);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${skill}</td>
      <td>${levelA}</td>
      <td>${levelB}</td>
      <td>${diff}</td>
      <td class="${who === "Equal" ? "" : who === "Two Ts 2" ? "better" : "worse"}">${who}</td>
    `;
    tableBody.appendChild(row);
  }
}

document.getElementById("refresh").addEventListener("click", updateTable);

// Refresh at the top of every hour
const now = new Date();
const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
setTimeout(() => {
  updateTable();
  setInterval(updateTable, 60 * 60 * 1000);
}, msUntilNextHour);

// Initial fetch
updateTable();

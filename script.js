const usernames = ["Two Ts 2", "Two Ts 1"];
const proxy = "https://corsproxy.io/?";
const baseUrl = "https://apps.runescape.com/runemetrics/profile/profile?user=";

async function fetchData(username) {
  const response = await fetch(proxy + encodeURIComponent(baseUrl + username));
  const data = await response.json();

  if (!data.skillvalues || !Array.isArray(data.skillvalues)) {
    console.error(`Missing or invalid skillvalues for ${username}`, data);
    return {};
  }

  return data.skillvalues.reduce((acc, skill) => {
    acc[skill.name] = skill.level;
    return acc;
  }, {});
}

function getDifference(a, b) {
  const diff = a - b;
  const who = diff === 0 ? "Equal" : diff > 0 ? "Two Ts 2" : "Two Ts 1";
  return [Math.abs(diff), who];
}

async function updateTable() {
  try {
    const [userData, userData2] = await Promise.all(usernames.map(fetchData));
    const tableBody = document.querySelector("#skill-table tbody");
    tableBody.innerHTML = "";

    const skills = new Set([...Object.keys(userData), ...Object.keys(userData2)]);
    skills.forEach((skill) => {
      const level1 = userData[skill] || 0;
      const level2 = userData2[skill] || 0;
      const [diff, who] = getDifference(level1, level2);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${skill}</td>
        <td class="${level1 > level2 ? "better" : level1 < level2 ? "worse" : ""}">${level1}</td>
        <td class="${level2 > level1 ? "better" : level2 < level1 ? "worse" : ""}">${level2}</td>
        <td>${diff}</td>
        <td>${who}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error updating table:", err);
  }
}

// Refresh manually
document.getElementById("refresh-btn").addEventListener("click", updateTable);

// Refresh every hour at start of hour
function scheduleHourlyRefresh() {
  const now = new Date();
  const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
  setTimeout(() => {
    updateTable();
    setInterval(updateTable, 60 * 60 * 1000);
  }, msUntilNextHour);
}

updateTable();
scheduleHourlyRefresh();

const usernames = ["Two Ts 2", "Two Ts 1"];
const baseUrl = "https://corsproxy.io/?https://apps.runescape.com/runemetrics/profile/profile?user=";

// Fetch and process data
async function fetchData(username) {
  const response = await fetch(baseUrl + encodeURIComponent(username));
  const data = await response.json();

  if (!data || !Array.isArray(data.skillvalues)) {
    throw new Error(`Invalid data for ${username}`);
  }

  const skills = {};
  for (const skill of data.skillvalues) {
    if (skill.level > 1) {
      skills[skill.name] = skill.level;
    }
  }

  return skills;
}

// Get difference and who's ahead
function getDifference(a, b) {
  const diff = a - b;
  const who = diff === 0 ? "Equal" : (diff > 0 ? usernames[0] : usernames[1]);
  return [Math.abs(diff), who];
}

// Update the table
async function update() {
  const table = document.querySelector("#skill-table tbody");
  table.innerHTML = "";

  try {
    const [userAData, userBData] = await Promise.all(usernames.map(fetchData));

    const allSkills = new Set([...Object.keys(userAData), ...Object.keys(userBData)]);
    allSkills.forEach(skill => {
      const a = userAData[skill] || 1;
      const b = userBData[skill] || 1;
      const [diff, who] = getDifference(a, b);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${skill}</td>
        <td>${a}</td>
        <td>${b}</td>
        <td>${diff}</td>
        <td>${who}</td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Update failed:", err);
  }
}

// Hourly auto-refresh
function setupAutoRefresh() {
  const now = new Date();
  const delay = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
  setTimeout(() => {
    update();
    setInterval(update, 60 * 60 * 1000); // every hour
  }, delay);
}

// Manual refresh
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("refresh");
  if (button) button.addEventListener("click", update);
  update();
  setupAutoRefresh();
});

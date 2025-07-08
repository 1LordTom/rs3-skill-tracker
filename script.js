document.addEventListener("DOMContentLoaded", () => {
  const usernames = ["Two Ts 2", "Two Ts 1"];
  const proxy = "https://corsproxy.io/?";
  const baseUrl = "https://apps.runescape.com/runemetrics/profile/profile?user=";

  const refreshIntervalMs = 60 * 60 * 1000; // 1 hour

  async function fetchData(username) {
    const response = await fetch(proxy + encodeURIComponent(baseUrl + username));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${username}`);
    }

    const data = await response.json();

    if (!data.skillvalues || !Array.isArray(data.skillvalues)) {
      throw new Error(`Invalid or missing skill data for ${username}`);
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
      const [user1Data, user2Data] = await Promise.all(usernames.map(fetchData));
      const tableBody = document.querySelector("#skill-table tbody");

      if (!tableBody) {
        console.error("Could not find #skill-table tbody in DOM.");
        return;
      }

      tableBody.innerHTML = ""; // Clear previous

      const allSkills = Object.keys(user1Data);
      allSkills.forEach(skill => {
        const u1 = user1Data[skill] || 0;
        const u2 = user2Data[skill] || 0;
        const [diff, who] = getDifference(u1, u2);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${skill}</td>
          <td>${u1}</td>
          <td>${u2}</td>
          <td>${diff}</td>
          <td class="${who === "Equal" ? "" : who === "Two Ts 2" ? "better" : "worse"}">${who}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  // Manual Refresh Button
  const refreshButton = document.getElementById("refresh-btn");
  if (refreshButton) {
    refreshButton.addEventListener("click", updateTable);
  } else {
    console.warn("Refresh button not found");
  }

  // Auto Refresh at top of each hour
  const now = new Date();
  const msToNextHour =
    (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
  setTimeout(() => {
    updateTable();
    setInterval(updateTable, refreshIntervalMs);
  }, msToNextHour);

  updateTable(); // Initial load
});

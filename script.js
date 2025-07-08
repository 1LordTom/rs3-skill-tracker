const usernames = ["Two Ts 2", "Two Ts 1"];
const proxyBase = "https://api.allorigins.win/raw?url=";
const baseUrl = "https://apps.runescape.com/runemetrics/profile/profile?user=";

let lastFetchTime = 0;
const fetchDelay = 10000; // 10 seconds between calls

async function fetchData(username) {
  const now = Date.now();
  if (now - lastFetchTime < fetchDelay) {
    await new Promise((res) => setTimeout(res, fetchDelay - (now - lastFetchTime)));
  }

  const encodedUrl = encodeURIComponent(baseUrl + username);
  const fullUrl = proxyBase + encodedUrl;

  const response = await fetch(fullUrl);
  if (!response.ok) throw new Error("Failed to fetch " + username);

  const data = await response.json();
  lastFetchTime = Date.now();

  if (!data.skillvalues) throw new Error("Invalid data for " + username);

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
    const [user1, user2] = await Promise.all(usernames.map(fetchData));
    const tableBody = document.querySelector("#skill-table tbody");
    tableBody.innerHTML = "";

    for (const skill in user1) {
      const row = document.createElement("tr");

      const diff = getDifference(user1[skill], user2[skill]);

      row.innerHTML = `
        <td>${skill}</td>
        <td>${user1[skill]}</td>
        <td>${user2[skill]}</td>
        <td>${diff[0]}</td>
        <td>${diff[1]}</td>
      `;

      row.className = diff[1] === "Equal" ? "" : diff[1] === "Two Ts 2" ? "better" : "worse";
      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("refresh").addEventListener("click", updateTable);

// Refresh at the top of every hour
const msToHour = 3600000 - (Date.now() % 3600000);
setTimeout(() => {
  updateTable();
  setInterval(updateTable, 3600000);
}, msToHour);

updateTable(); // Initial load

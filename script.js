const proxy = "https://corsproxy.io/?";
const baseUrl = "https://apps.runescape.com/runemetrics/profile/profile?user=";

const player1 = "Two Ts 2";
const player2 = "Two Ts 1";

async function fetchData(player) {
  const response = await fetch(`${proxy}${baseUrl}${encodeURIComponent(player)}`);
  if (!response.ok) throw new Error(`Failed to fetch ${player}`);
  const data = await response.json();
  return data.skills.reduce((acc, skill) => {
    acc[skill.name] = skill.level;
    return acc;
  }, {});
}

function calculateDifference(p1, p2) {
  const skills = Object.keys(p1);
  return skills.map(skill => {
    const diff = p1[skill] - p2[skill];
    return {
      skill,
      p1: p1[skill],
      p2: p2[skill],
      diff,
      lead: diff === 0 ? "Even" : (diff > 0 ? player1 : player2)
    };
  });
}

function updateTable(data) {
  const table = document.getElementById("skills-table");
  table.innerHTML = `
    <tr>
      <th>Skill</th><th>${player1}</th><th>${player2}</th><th>Difference</th><th>Who's Ahead</th>
    </tr>`;
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.skill}</td>
      <td>${row.p1}</td>
      <td>${row.p2}</td>
      <td>${row.diff}</td>
      <td>${row.lead}</td>`;
    table.appendChild(tr);
  });
}

async function update() {
  try {
    const [data1, data2] = await Promise.all([fetchData(player1), fetchData(player2)]);
    const diff = calculateDifference(data1, data2);
    updateTable(diff);
  } catch (error) {
    console.error(error);
    document.getElementById("skills-table").innerHTML = `<tr><td colspan="5">Error loading data: ${error.message}</td></tr>`;
  }
}

update();


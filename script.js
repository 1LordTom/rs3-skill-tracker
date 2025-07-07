const skills = [
  "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer", "Magic",
  "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting",
  "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming",
  "Runecrafting", "Hunter", "Construction", "Summoning", "Dungeoneering",
  "Divination", "Invention", "Archaeology", "Necromancy"
];

async function fetchData(username) {
  const res = await fetch(`https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(username)}`);
  const data = await res.json();
  return data.skillvalues.map(s => s.level);
}

function compareSkills(myLevels, friendLevels) {
  const tbody = document.querySelector("#skill-table tbody");
  tbody.innerHTML = "";
  skills.forEach((skill, i) => {
    const myLvl = myLevels[i];
    const friendLvl = friendLevels[i];
    const diff = myLvl - friendLvl;
    const who = diff > 0 ? "You" : diff < 0 ? "Friend" : "Equal";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${skill}</td>
      <td>${myLvl}</td>
      <td>${friendLvl}</td>
      <td>${diff}</td>
      <td>${who}</td>
    `;
    tbody.appendChild(row);
  });
}

async function updateTable() {
  const myLevels = await fetchData("Two Ts 2");
  const friendLevels = await fetchData("Two Ts 1");
  compareSkills(myLevels, friendLevels);
}

updateTable();

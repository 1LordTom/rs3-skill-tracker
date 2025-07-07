const usernames = {
  you: "Two Ts 2",
  friend: "Two Ts 1"
};

const skillTable = document.getElementById("skill-table").querySelector("tbody");

async function fetchData(user) {
  const url = `https://corsproxy.io/?https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(user)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.skillvalues.reduce((acc, skill) => {
    acc[skill.id] = skill.level;
    return acc;
  }, {});
}

const skillNames = [
  "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer", "Magic", "Cooking",
  "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining",
  "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecrafting", "Hunter",
  "Construction", "Summoning", "Dungeoneering", "Divination", "Invention", "Archaeology", "Necromancy"
];

async function update() {
  try {
    const [youData, friendData] = await Promise.all([
      fetchData(usernames.you),
      fetchData(usernames.friend)
    ]);

    skillTable.innerHTML = "";
    skillNames.forEach((name, id) => {
      const youLvl = youData[id] ?? 0;
      const friendLvl = friendData[id] ?? 0;
      const diff = youLvl - friendLvl;
      const winner = diff === 0 ? "-" : diff > 0 ? "You" : "Friend";

      const row = document.createElement("tr");
      if (winner === "You") row.classList.add("you");
      if (winner === "Friend") row.classList.add("friend");

      row.innerHTML = `
        <td>${name}</td>
        <td>${youLvl}</td>
        <td>${friendLvl}</td>
        <td>${Math.abs(diff)}</td>
        <td>${winner}</td>
      `;
      skillTable.appendChild(row);
    });
  } catch (err) {
    console.error("Error updating table:", err);
    skillTable.innerHTML = `<tr><td colspan="5">Failed to fetch data. Please try again later.</td></tr>`;
  }
}

update();

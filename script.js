const json = require("./mock-data.json");
const fs = require("node:fs");

const result = [];

function generateEmployeeId(index) {
  const prefix = "EMP";
  const numberPart = index.toString().padStart(3, "0");
  return `${prefix}${numberPart}`;
}

for (let i = 0; i < json.length; i++) {
  const co = json[i];
  // co.department = departmentPrefixes[co.department];
  co.id = generateEmployeeId(i + 1);

  result.push(co);
}

fs.writeFileSync("./mock-data.json", JSON.stringify(result));

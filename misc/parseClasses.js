const fs = require("fs");
const buffer = fs.readFileSync("classes.txt");
const inputs = buffer.toString().split("\n");

let output = {};

inputs.map((c, i) => {
  let cl = c.split(",");
  let formatted = {
    name: cl[0],
    lvl: +cl[1],
    stats: {
      VIGOR: +cl[2],
      ATTUNEMENT: +cl[3],
      ENDURANCE: +cl[4],
      VITALITY: +cl[5],
      STRENGTH: +cl[6],
      DEXTERITY: +cl[7],
      INTELLIGENCE: +cl[8],
      FAITH: +cl[9],
      LUCK: +cl[10],
    },
  };
  output[cl[0]] = formatted;
});

fs.writeFileSync("../src/data/baseClasses.json", JSON.stringify(output));

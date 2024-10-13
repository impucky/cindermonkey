import React, { Component } from "react";
import baseClasses from "./../data/baseClasses";
import statData from "./../data/statData";

import helm from "./../data/armor/helm.json";
import chest from "./../data/armor/chest.json";
import gloves from "./../data/armor/gloves.json";
import legs from "./../data/armor/legs.json";

const equipLists = {
  helm: Object.keys(helm),
  chest: Object.keys(chest),
  gloves: Object.keys(gloves),
  legs: Object.keys(legs),
};

const equips = {
  helm: helm,
  chest: chest,
  gloves: gloves,
  legs: legs,
};

function importIcons(r) {
  let icons = {};
  r.keys().map((item, index) => {
    return (icons[item.replace("./", "").replace(".png", "").toUpperCase()] = r(item));
  });
  return icons;
}

const icons = importIcons(require.context("../img/icons", false, /\.(png|jpe?g|svg)$/));

class Planner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      build: {
        class: "Accursed",
        lvl: 1,
        stats: {
          VIGOR: 0,
          ATTUNEMENT: 0,
          ENDURANCE: 0,
          VITALITY: 0,
          STRENGTH: 0,
          DEXTERITY: 0,
          INTELLIGENCE: 0,
          FAITH: 0,
          LUCK: 0,
        },
        equipment: {
          helm: "",
          chest: "",
          gloves: "",
          legs: "",
        },
      },
      equipLoad: "0/40 (0.0%)",
      equipBonus: 1,
      extraWeight: 0,
      searchResults: [],
      currentSearch: null,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.pending) {
      let build = this.updateBuild(this.props.newBuild);
      this.setState({ build }, this.props.finishUpdate);
    } else return;
  }

  updateBuild(newBuild) {
    let newStats = newBuild.stats;
    let build = { ...this.state.build };
    let base = { ...baseClasses[newBuild.class] };

    build.class = newBuild.class;
    build.stats = JSON.parse(JSON.stringify(base.stats));
    build.lvl = newBuild.lvl;

    Object.keys(build.stats).forEach((s) => {
      build.lvl += build.stats[s] - base.stats[s];
    });

    Object.keys(build.stats).forEach((s) => {
      let baseStat = base.stats[s];
      if (newStats[s] >= baseStat) build.stats[s] = newStats[s];
      else build.stats[s] = baseStat.valueOf();
    });
    return build;
  }

  onStatInput(e, s) {
    let build = { ...this.state.build };
    let stats = build.stats;
    let input = e.target.value;
    if (isNaN(input)) return;
    else if (input > 99) input = 99;
    else if (input === "00") input = 0;
    else if (input.length === 2 && input.startsWith("0")) input = +input[1];
    else if (input < 0) input = 0;
    stats[s] = +input;
    this.setState({ build });
    this.onStatChange();
  }

  onStatInc(s) {
    let build = { ...this.state.build };
    let stats = build.stats;
    if (+stats[s] === 99) return;
    stats[s]++;
    this.setState({ build });
    this.onStatChange();
  }

  onStatDec(s) {
    let build = { ...this.state.build };
    let stats = build.stats;
    if (+stats[s] === 0 || +stats[s] === baseClasses[build.class].stats[s]) return;
    stats[s]--;
    this.setState({ build });
    this.onStatChange();
  }

  onStatBlur(e, s) {
    let build = { ...this.state.build };
    let stats = build.stats;
    let base = { ...baseClasses[build.class] };
    let baseStat = base.stats[s];
    if (+e.target.value < baseStat) stats[s] = baseStat;
    this.setState({ build });
    this.onStatChange();
  }

  onStatChange() {
    let build = { ...this.state.build };
    let stats = build.stats;
    let base = { ...baseClasses[build.class] };
    build.lvl = base.lvl;
    Object.keys(base.stats).forEach((s) => {
      build.lvl += stats[s] - base.stats[s];
    });
    this.setState({ build }, this.calcEquipLoad);
  }

  pickClass(e) {
    let newClass = e;
    let build = { ...this.state.build };
    let base = { ...baseClasses[newClass] };
    build.class = newClass;
    build.lvl = base.lvl;
    build.stats = { ...base.stats };
    this.setState({ build });
  }

  onEquipSearch(e, slot) {
    let build = this.state.build;
    let input = e.target.value.toLowerCase();
    let list = equipLists[slot];
    let results = list
      .filter((item) => {
        return item.toLowerCase().includes(input);
      })
      .slice(0, 9);
    if (input === "") results = [];
    build.equipment[slot] = input;
    this.setState({ searchResults: results, currentSearch: slot, build });
  }

  onEquipFocus(e) {
    e.target.select();
  }

  onEquipBlur(e, slot) {
    let build = this.state.build;
    if (!build.equipment[slot].name) build.equipment[slot] = "";
    // wait for potential result click
    setTimeout(() => {
      this.setState({ searchResults: [], build, currentSearch: null });
    }, 200);
  }

  pickEquipment(i) {
    let slot = this.state.currentSearch;
    let picked = this.state.searchResults[i];
    let build = this.state.build;

    build.equipment[slot] = equips[slot][picked];

    this.setState({ build, searchResults: [], currentSearch: null }, this.calcEquipLoad);
  }

  clearEquip(slot) {
    let build = this.state.build;
    build.equipment[slot] = "";
    this.setState({ build }, this.calcEquipLoad);
  }

  calcEquipLoad() {
    let equipment = this.state.build.equipment;
    let total = this.state.extraWeight;
    let max = statData["load"][this.state.build.stats["VITALITY"]] * this.state.equipBonus;

    Object.keys(equipment).forEach((s) => {
      if (!equipment[s].name) return;
      else total += +equipment[s].weight;
    });

    let output = `${total.toFixed(1)}/${max.toFixed(1)} (${((total / max) * 100).toFixed(1)}%)`;

    this.setState({
      equipLoad: output,
    });
  }

  extraWeight(e) {
    let extraWeight = Number(e.target.value);

    if (extraWeight) {
      this.setState({ extraWeight }, this.calcEquipLoad);
    } else this.setState({ extraWeight: 0 }, this.calcEquipLoad);
  }

  equipMods(e) {
    let modifiers = [];
    let input = e.target.value.split(",").map((n) => {
      if (Number(n)) modifiers.push(Number(n) / 100 + 1);
    });
    if (modifiers.length === 0) {
      this.setState({ equipBonus: 1 }, this.calcEquipLoad);
      return;
    }

    let total = modifiers.reduce((a, b) => a * b).toFixed(2);
    this.setState({ equipBonus: total }, this.calcEquipLoad);
  }

  render() {
    let build = this.state.build;
    let stats = build.stats;
    let equip = build.equipment;
    let equipResults = this.state.searchResults.map((item, i) => {
      return (
        <button className="equipResult" key={i} onClick={() => this.pickEquipment(i)}>
          {item}
        </button>
      );
    });
    return (
      <div className="planner">
        <h3>Class </h3>
        <select name="class" value={build.class} onChange={(e) => this.pickClass(e.target.value)}>
          {Object.keys(baseClasses)
            .sort()
            .map((s, i) => {
              return (
                <option key={i} value={s}>
                  {s}
                </option>
              );
            })}
        </select>
        <div className="build">
          <ul className="statblock">
            {Object.keys(stats).map((s, i) => {
              return (
                <li key={s} className="stat">
                  <span>
                    <img src={icons[s]} alt="" />
                    {s}
                  </span>
                  <div>
                    <button className="statButton" tabIndex="-1" onClick={() => this.onStatDec(s)}>
                      -
                    </button>
                    <input
                      className="statinput"
                      value={stats[s]}
                      onChange={(e) => this.onStatInput(e, s)}
                      onBlur={(e) => this.onStatBlur(e, s)}
                    ></input>
                    <button className="statButton" tabIndex="-1" onClick={() => this.onStatInc(s)}>
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <ul className="info">
            <li>
              <span>
                <img src={icons["LEVEL"]} alt="icon" />
                Level
              </span>
              <span>{build.lvl}</span>
            </li>
            <li>
              <span>
                <img src={icons["HP"]} alt="icon" />
                HP
              </span>
              <span>
                {statData["HP"][stats["VIGOR"]]} (
                <span className="embers">{(statData["HP"][stats["VIGOR"]] * 1.3).toFixed()}</span>)
              </span>
            </li>
            <li>
              <span>
                <img src={icons["FP"]} alt="icon" />
                FP
              </span>
              <span>{statData["FP"][stats["ATTUNEMENT"]]}</span>
            </li>
            <li>
              <span>
                <img src={icons["STAMINA"]} alt="icon" />
                Stamina
              </span>
              <span>{statData["stamina"][stats["ENDURANCE"]]}</span>
            </li>
            <li>
              <span>
                <img src={icons["SLOTS"]} alt="icon" />
                Attunement Slots
              </span>
              <span>{statData["Slots"][stats["ATTUNEMENT"]]}</span>
            </li>
            <li>
              <span>
                <img src={icons["WEIGHT"]} alt="icon" />
                Equip Load
              </span>
              <span>{this.state.equipLoad}</span>
            </li>
          </ul>

          <div className="info">
            <span>Helmet</span>
            <br />
            <input
              className="equipinput"
              value={equip.helm.name || equip.helm}
              placeholder="Search"
              onChange={(e) => this.onEquipSearch(e, "helm")}
              onFocus={this.onEquipFocus}
              onBlur={(e) => this.onEquipBlur(e, "helm")}
            />
            <button className="statButton" onClick={() => this.clearEquip("helm")}>
              X
            </button>
            <div className="equipResults">
              {this.state.currentSearch === "helm" ? equipResults : ""}
            </div>
            <span>Chest</span>
            <br />
            <input
              className="equipinput"
              value={equip.chest.name || equip.chest}
              placeholder="Search"
              onChange={(e) => this.onEquipSearch(e, "chest")}
              onFocus={this.onEquipFocus}
              onBlur={(e) => this.onEquipBlur(e, "chest")}
            />
            <button className="statButton" onClick={() => this.clearEquip("chest")}>
              X
            </button>
            <div className="equipResults">
              {this.state.currentSearch === "chest" ? equipResults : ""}
            </div>
            <span>Gloves</span>
            <br />
            <input
              className="equipinput"
              value={equip.gloves.name || equip.gloves}
              placeholder="Search"
              onChange={(e) => this.onEquipSearch(e, "gloves")}
              onFocus={this.onEquipFocus}
              onBlur={(e) => this.onEquipBlur(e, "gloves")}
            />
            <button className="statButton" onClick={() => this.clearEquip("gloves")}>
              X
            </button>
            <div className="equipResults">
              {this.state.currentSearch === "gloves" ? equipResults : ""}
            </div>
            <span>Legs</span>
            <br />
            <input
              className="equipinput"
              value={equip.legs.name || equip.legs}
              placeholder="Search"
              onChange={(e) => this.onEquipSearch(e, "legs")}
              onFocus={this.onEquipFocus}
              onBlur={(e) => this.onEquipBlur(e, "legs")}
            />
            <button className="statButton" onClick={() => this.clearEquip("legs")}>
              X
            </button>
            <div className="equipResults">
              {this.state.currentSearch === "legs" ? equipResults : ""}
            </div>
            <p>------</p>
            <span className="indev">Extra weight from rings + weapons</span>
            <input
              className="equipinput"
              placeholder="extra weight"
              onChange={(e) => this.extraWeight(e)}
            />
            <p>------</p>
            <span className="indev">
              % boosts to maximum equipment load, comma-separated (e.g. "10, 20, 10")
            </span>
            <br />
            <input
              className="equipinput"
              placeholder="modifiers"
              onChange={(e) => this.equipMods(e)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Planner;

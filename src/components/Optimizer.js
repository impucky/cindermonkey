import React, { Component } from "react";
import baseClasses from "./../data/baseClasses";

function importIcons(r) {
  let icons = {};
  r.keys().map((item, index) => {
    return (icons[item.replace("./", "").replace(".png", "").toUpperCase()] = r(
      item
    ));
  });
  return icons;
}

const icons = importIcons(
  require.context("../img/icons", false, /\.(png|jpe?g|svg)$/)
);

class Optimizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      best: [],
    };
  }

  componentDidMount() {
    this.onStatChange();
  }

  onStatInput(e, s) {
    let newStats = this.state.stats;
    let newVal = e.target.value;
    if (isNaN(newVal)) return;
    else if (newVal > 99) newVal = 99;
    else if (newVal === "00") newVal = 0;
    else if (newVal.length === 2 && newVal.startsWith("0")) newVal = +newVal[1];
    else if (newVal < 0) newVal = 0;
    newStats[s] = +newVal;
    this.setState({ stats: newStats });
    this.onStatChange();
  }

  onStatInc(s) {
    let newStats = this.state.stats;
    if (+newStats[s] === 99) return;
    newStats[s]++;
    this.setState({ stats: newStats });
    this.onStatChange();
  }

  onStatDec(s) {
    let newStats = this.state.stats;
    if (+newStats[s] === 0) return;
    newStats[s]--;
    this.setState({ stats: newStats });
    this.onStatChange();
  }

  onStatChange() {
    let wanted = this.state.stats;
    let scores = [];
    Object.keys(baseClasses).forEach((cl) => {
      scores.push(this.calcScore(wanted, baseClasses[cl]));
    });
    scores = scores.sort((a, b) => a[0] - b[0]);
    this.setState({ best: scores });
  }

  calcScore(wanted, base) {
    let lvl = base.lvl;
    Object.keys(base.stats).forEach((s) => {
      let diff = wanted[s] - base.stats[s];
      if (diff < 1) return;
      else lvl += diff;
    });
    return [lvl, base.name];
  }

  reset() {
    this.setState(
      {
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
      },
      this.onStatChange
    );
  }

  render() {
    let stats = this.state.stats;
    let best = this.state.best;
    return (
      <div className="optimizer">
        <div className="stats">
          <h3>Target stats</h3>{" "}
          <button onClick={() => this.reset()} className="btn-reset">
            Reset
          </button>
          <ul className="statblock">
            {Object.keys(stats).map((s, i) => {
              return (
                <li key={s} className="stat">
                  <span>
                    <img src={icons[s]} alt="" />
                    {s}
                  </span>
                  <div>
                    <button
                      className="statButton"
                      tabIndex="-1"
                      onClick={() => this.onStatDec(s)}
                    >
                      -
                    </button>
                    <input
                      className="statinput"
                      value={stats[s]}
                      onChange={(e) => this.onStatInput(e, s)}
                    ></input>
                    <button
                      className="statButton"
                      tabIndex="-1"
                      onClick={() => this.onStatInc(s)}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="results">
          <ul>
            {best.map((cl, i) => {
              return (
                <li
                  key={i}
                  className="result"
                  onClick={() =>
                    this.props.send({
                      class: cl[1],
                      lvl: cl[0],
                      stats: this.state.stats,
                    })
                  }
                >
                  <span>{cl[1]}</span>{" "}
                  <span className="btn-plan">go to planner</span>
                  <span>lvl {cl[0]}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default Optimizer;

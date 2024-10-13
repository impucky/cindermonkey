import React, { Component } from "react";
import Optimizer from "./components/Optimizer";
import Planner from "./components/Planner";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeRoute: "planner",
      pendingUpdate: false,
      toPlanner: {
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
      },
    };

    this.sendToPlanner = this.sendToPlanner.bind(this);
    this.finishUpdate = this.finishUpdate.bind(this);
  }

  finishUpdate() {
    this.setState({ pendingUpdate: false });
  }

  sendToPlanner(newBuild) {
    this.setState({
      activeRoute: "planner",
      toPlanner: newBuild,
      pendingUpdate: true,
    });
  }

  render() {
    return (
      <div className="app">
        <div className="nav">
          Cinders 1.73 -
          <span
            className={`nav-item ${this.state.activeRoute === "planner" ? "active embers" : ""}`}
            onClick={() => this.setState({ activeRoute: "planner" })}
          >
            Build Planner
          </span>
          <span
            className={`nav-item ${this.state.activeRoute === "optimizer" ? "active embers" : ""}`}
            onClick={() => this.setState({ activeRoute: "optimizer" })}
          >
            Class Optimizer
          </span>
        </div>
        <div
          style={{
            display: this.state.activeRoute === "planner" ? "block" : "none",
          }}
        >
          <Planner
            newBuild={this.state.toPlanner}
            pending={this.state.pendingUpdate}
            finishUpdate={this.finishUpdate}
          />
        </div>
        <div
          style={{
            display: this.state.activeRoute === "optimizer" ? "block" : "none",
          }}
        >
          <Optimizer send={this.sendToPlanner} />
        </div>
      </div>
    );
  }
}

export default App;

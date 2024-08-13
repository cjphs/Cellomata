class Ruleset {
  constructor(states) {
    this.states = states;
    this.clauses = {};

    this.states.forEach((s) => {
      this.clauses[s] = [];
    });
  }

  addRule = function (fromState, clause) {
    this.clauses[fromState].push(clause);
  };

  getDefaultState = function () {
    return this.states[0];
  };

  getStatesDict = function (defaultValue = 0) {
    const dict = {};
    this.states.forEach((s) => {
      dict[s] = defaultValue;
    });

    return dict;
  };
}

export default Ruleset;

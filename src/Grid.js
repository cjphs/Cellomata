class Grid {
  constructor(width, height, rules, state_cols, wrap) {
    this.rules = rules;

    this.width = width;
    this.height = height;
    this.wrap = wrap;

    this.grid = this.getEmptyGrid();
    this.stateCols = {};

    this.stateCounts = {};

    this.rules.states.forEach((s) => {
      this.stateCounts[s] = 0;
    });
  }

  // creates an empty with the default state
  getEmptyGrid = function () {
    const grid = [[]];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = this.rules.getDefaultState();
      }
    }
    return grid;
  };

  getStateCounts = function () {
    return this.stateCounts;
  };

  resetGrid = function (only_override_nonexistant_states = false) {
    if (!only_override_nonexistant_states) {
      this.grid = this.getEmptyGrid();
    } else {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (!this.rules.states.includes(this.getCellState(x, y))) {
            this.setCellState(x, y, this.rules.getDefaultState());
          }
        }
      }
    }
  };

  coordinatesInBounds = function (x, y) {
    return (x >= 0) & (x < this.width) & (y >= 0) & (y < this.height);
  };

  getCellState = function (x, y) {
    if (this.wrap) {
      x = (this.width + x) % this.width;
      y = (this.height + y) % this.height;
    }

    var state = "";
    if (this.coordinatesInBounds(x, y)) state = this.grid[y][x];
    return state;
  };

  setCellState = function (x, y, state) {
    if (this.coordinatesInBounds(x, y)) this.grid[y][x] = state;
  };

  step = function () {
    var next_grid = this.getEmptyGrid();

    let s_counts_new = {};
    this.rules.states.forEach((s) => {
      s_counts_new[s] = 0;
    });

    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var cell_state = this.getCellState(x, y);

        next_grid[y][x] = cell_state;

        var neighborhoodDict = this.rules.getStatesDict();

        for (var i = x - 1; i < x + 2; i++) {
          for (var j = y - 1; j < y + 2; j++) {
            if (i == x && j == y) continue;
            // if (this.coordinatesInBounds(i,j))
            var state = this.getCellState(i, j);

            if (state != "") neighborhoodDict[state] += 1;
          }
        }

        neighborhoodDict["*below"] = this.getCellState(x, y + 1);
        neighborhoodDict["*above"] = this.getCellState(x, y - 1);
        neighborhoodDict["*left"] = this.getCellState(x - 1, y);
        neighborhoodDict["*right"] = this.getCellState(x + 1, y);
        neighborhoodDict["*bottomleft"] = this.getCellState(x - 1, y + 1);
        neighborhoodDict["*bottomright"] = this.getCellState(x + 1, y + 1);
        neighborhoodDict["*topleft"] = this.getCellState(x - 1, y - 1);
        neighborhoodDict["*topright"] = this.getCellState(x + 1, y - 1);

        rule_loop: for (
          let r = 0;
          r < this.rules.clauses[cell_state].length;
          r++
        ) {
          let rule = this.rules.clauses[cell_state][r];

          if (!rule.do_evaluation) continue rule_loop;

          let truth_value = rule.evaluate(neighborhoodDict);
          if (truth_value) {
            conjunction_check: while (rule.conjucted_with != null) {
              rule = rule.conjucted_with;
              truth_value = rule.evaluate(neighborhoodDict);

              if (!truth_value) {
                break conjunction_check;
              }
            }
          }
          if (truth_value) {
            next_grid[y][x] = rule.transformState;
            s_counts_new[next_grid[y][x]] += 1;

            break rule_loop;
          }
        }
      }
    }

    this.stateCounts = s_counts_new;

    this.grid = next_grid;
  };

  asString = function (columnDelimiter = ",", rowDelimiter = "\n") {
    let s = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        s += this.grid[y][x] + (x < this.width - 1 ? columnDelimiter : "");
      }
      s += rowDelimiter;
    }

    return s;
  };
}

export default Grid;

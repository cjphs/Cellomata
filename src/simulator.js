class Clause {
  constructor (
    transformState,
    localityCheckType,
    localityCheckState = '',
    localityCount = -1,
    chance = 1,
    localityRangeMin = 0,
    localityRangeMax = 9
  )

  {
    // End state of the cell, should this transformation be successful
    this.transformState = transformState

    // Mode of the locality check (nearby/always)
    this.localityCheckType = localityCheckType

    // State to look for in the locality check
    this.localityCheckState = localityCheckState

    // How many cells of the locality check state should be in the neighborhood (-1 = any amount but 0)
    this.localityCount = localityCount

    this.localityRangeMin = localityRangeMin

    this.localityRangeMax = localityRangeMax

    // Chance of the transformation occuring (for probabilistic CA)
    this.chance = chance

    // if not null, then this rule must be true with the next rule
    this.conjucted_with = null

    this.do_evaluation = true

    this.equality_type = '='
  }

  conjunctWith = function (transformation) {
    this.conjucted_with = transformation
  }

  // True -> Cell being investigated becomes the transformState.
  evaluate = function (neighborhoodDict) {
    if (Math.random() >= this.chance) { return false }

    switch (this.localityCheckType) {
      case 'always':
        return true
      
      case 'nearby':
        let n = neighborhoodDict[this.localityCheckState];

        return (this.localityRangeMin <= n) && (n <= this.localityRangeMax)

      case 'majority':
        let mostNeighborsCount = 0
        let mostNeighborsState = ''

        states.forEach(s => {
          if (neighborhoodDict[s] > mostNeighborsCount) {
            mostNeighborsCount = neighborhoodDict[s]
            mostNeighborsState = s
          }
        })

        return (mostNeighborsState === this.localityCheckState)

      // directional
      default:
        if (this.localityCount !== 0) {
          return (neighborhoodDict['*' + this.localityCheckType] === this.localityCheckState)
        } else {
          return (neighborhoodDict['*' + this.localityCheckType] !== this.localityCheckState)
        }
    }
  }
}

class Ruleset {
  constructor (states) {
    this.states = states
    this.clauses = {}

    this.states.forEach(s => {
      this.clauses[s] = []
    })

    console.log(this.states)
    console.log(this.clauses)
  }

  addRule = function (fromState, clause) {
    this.clauses[fromState].push(clause)
  }

  getDefaultState = function () {
    return this.states[0]
  }

  getStatesDict = function (defaultValue = 0) {
    const dict = {}
    this.states.forEach(s => {
      dict[s] = defaultValue
    })

    return dict
  }
}

class Grid {
  constructor (width, height, rules) {
    this.width = width
    this.height = height

    this.rules = rules

    this.wrap = true

    this.grid = this.getEmptyGrid()

    this.stateCounts = {}

    this.rules.states.forEach(s => {
      this.stateCounts[s] = 0
    })
  }

  // creates an empty with the default state
  getEmptyGrid = function () {
    const grid = [[]]
    for (let y = 0; y < this.height; y++) {
      grid[y] = []
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = this.rules.getDefaultState()
      }
    }
    return grid
  }

  getStateCounts = function () {
    return this.stateCounts
  }

  resetGrid = function (only_override_nonexistant_states = false) {
    if (!only_override_nonexistant_states) {
      this.grid = this.getEmptyGrid();
    } else {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (!this.rules.states.includes(this.getCellState(x, y))) {
            this.setCellState(x, y, this.rules.getDefaultState())
          }
        }
      }
    }
  }

    // Check if (x,y) are valid coordinates in the grid
    coordinatesInBounds = function(x,y) {
        return (x >= 0 & x < this.width & y >= 0 & y < this.height)
    }

    getCellState = function(x,y) {
        if (this.wrap) {
            x = (this.width + x) % this.width;
            y = (this.height + y) % this.height;
        }

        var state = "";
        if (this.coordinatesInBounds(x,y))
            state = this.grid[y][x];
        return state;
    }

    setCellState = function(x,y,state) {
        if (this.coordinatesInBounds(x,y))
            this.grid[y][x] = state;
    }

    // Evolve the grid by one step
    evolve = function() {
        var next_grid = this.getEmptyGrid();

        let s_counts_new = {};
        this.rules.states.forEach(s => {
            s_counts_new[s] = 0;
        })

        for(var y = 0; y < this.height; y++) {
            for(var x = 0; x < this.width; x++) {
                var cell_state = this.getCellState(x,y);

                next_grid[y][x] = cell_state;

                var neighborhoodDict = this.rules.getStatesDict();

                for(var i = x-1; i < x+2; i++) {
                    for(var j = y-1; j < y+2; j++) {
                        if ((i == x && j == y))
                            continue;
                        // if (this.coordinatesInBounds(i,j))
                        var state = this.getCellState(i,j);

                        if (state != "")
                            neighborhoodDict[state] += 1;
                    }
                }

                neighborhoodDict["*below"] = this.getCellState(x,y+1);
                neighborhoodDict["*above"] = this.getCellState(x,y-1);
                neighborhoodDict["*left"] = this.getCellState(x-1,y);
                neighborhoodDict["*right"] = this.getCellState(x+1,y);
                neighborhoodDict["*bottomleft"] = this.getCellState(x-1,y+1);
                neighborhoodDict["*bottomright"] = this.getCellState(x+1,y+1);
                neighborhoodDict["*topleft"] = this.getCellState(x-1,y-1);
                neighborhoodDict["*topright"] = this.getCellState(x+1,y-1);

                rule_loop:
                for(let r = 0; r < this.rules.clauses[cell_state].length; r++) {
                    let rule = this.rules.clauses[cell_state][r];

                    if (!rule.do_evaluation)
                        continue rule_loop;
                    
                    let truth_value = rule.evaluate(neighborhoodDict);
                    if (truth_value) {
                        conjunction_check: 
                        while(rule.conjucted_with != null) {
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
    }

  /**
   * Returns a string
   * @param {string} row_delimiter The character by which cells should be spaced out
   * @param {string} column_delimiter The character by which cells should be spaced out
   * @returns {string} The integer value associated with the variable
   */
  asString = function (multiline = false, columnDelimiter = ',', rowDelimiter = '\n') {
    let s = ''
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        s += this.grid[y][x] + (x < this.width - 1 ? columnDelimiter : '')
      }
      s += rowDelimiter
    }

    return s
  }
}

export { Clause, Ruleset, Grid }

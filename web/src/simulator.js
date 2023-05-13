class Clause {
    constructor(
        transform_state,
        locality_check_type,
        locality_check_state="",
        locality_count=-1,
        chance=1,
        locality_range_min=0,
        locality_range_max=9
    ) 
    {
        // End state of the cell, should this transformation be successful
        this.transform_state = transform_state;

        // Mode of the locality check (nearby/always)
        this.locality_check_type = locality_check_type;

        // State to look for in the locality check
        this.locality_check_state = locality_check_state;

        this.locality_check_min = locality_range_min;
        this.locality_check_max = locality_range_max;

        // How many cells of the locality check state should be in the neighborhood (-1 = any amount but 0)
        this.locality_count = locality_count;

        this.locality_range_min = locality_range_min;

        this.locality_range_max = locality_range_max;

        // Chance of the transformation occuring (for probabilistic CA)
        this.chance = chance;

        // if not null, then this rule must be true with the next rule
        this.conjucted_with = null;

        this.do_evaluation = true;

        this.equality_type = "=";
    }

    conjunctWith = function(transformation) {
        this.conjucted_with = transformation
    }

    // True -> Cell being investigated becomes the transform_state.
    evaluate = function(neighborhood_dict) {
        if (Math.random() >= this.chance)
            return false;

        switch(this.locality_check_type) {
            case "always":
                return true;
            
            case "nearby":
                let n = neighborhood_dict[this.locality_check_state];

                return (this.locality_check_min <= n) && (n <= this.locality_check_max);
                break;

            case "majority":
                var most_neighbors_count = 0;
                var most_neighbors_state = "";

                states.forEach(s => {
                    if (neighborhood_dict[s] > most_neighbors_count) {
                        most_neighbors_count = neighborhood_dict[s];
                        most_neighbors_state = s;
                    } 
                });

                return (most_neighbors_state == this.locality_check_state);
                break;

            // directional
            default:
                if (this.locality_count != 0)
                    return (neighborhood_dict["*" + this.locality_check_type] == this.locality_check_state)
                else
                    return (neighborhood_dict["*" + this.locality_check_type] != this.locality_check_state)
        }
    }
}

class Ruleset {
    constructor(states) {
        this.states = states;
        this.clauses = {};

        this.states.forEach(s => {
            this.clauses[s] = [];
        })

        console.log(this.states);
        console.log(this.clauses);
    }

    addRule = function(from_state, clause) {
        this.clauses[from_state].push(clause);
    }

    getDefaultState = function() {
        return this.states[0];
    }

    getStatesDict = function(default_value=0) {
        var dict = {};
        this.states.forEach(s => {
            dict[s] = default_value;
        })

        return dict;
    }
}


class Grid {
    constructor(width, height, rules) {
        this.width = width;
        this.height = height;

        this.rules = rules;

        this.wrap = true;

        this.grid = this.getEmptyGrid();

        this.state_counts = {};

        
        this.rules.states.forEach(s => {
            this.state_counts[s] = 0;
        })
    }

    // creates an empty with the default state
    getEmptyGrid = function() {
        var grid = [[]];
        for(var y = 0; y < this.height; y++) {
            grid[y] = [];
            for(var x = 0; x < this.width; x++) {
                grid[y][x] = this.rules.getDefaultState();
            }
        }
        return grid;
    }

    getStateCounts = function() {
        return this.state_counts;
    }

    resetGrid = function(only_override_nonexistant_states=false) {
        if (!only_override_nonexistant_states)
            this.grid = this.getEmptyGrid();
        else {
            for(var y = 0; y < this.height; y++) {
                for(var x = 0; x < this.width; x++) {
                    if (!this.rules.states.includes(this.getCellState(x,y)))
                        this.setCellState(x,y,this.rules.getDefaultState());
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

                var neighborhood_dict = this.rules.getStatesDict();

                for(var i = x-1; i < x+2; i++) {
                    for(var j = y-1; j < y+2; j++) {
                        if ((i == x && j == y))
                            continue;
                        // if (this.coordinatesInBounds(i,j))
                        var state = this.getCellState(i,j);

                        if (state != "")
                            neighborhood_dict[state] += 1;
                    }
                }

                neighborhood_dict["*below"] = this.getCellState(x,y+1);
                neighborhood_dict["*above"] = this.getCellState(x,y-1);
                neighborhood_dict["*left"] = this.getCellState(x-1,y);
                neighborhood_dict["*right"] = this.getCellState(x+1,y);
                neighborhood_dict["*bottomleft"] = this.getCellState(x-1,y+1);
                neighborhood_dict["*bottomright"] = this.getCellState(x+1,y+1);
                neighborhood_dict["*topleft"] = this.getCellState(x-1,y-1);
                neighborhood_dict["*topright"] = this.getCellState(x+1,y-1);

                rule_loop:
                for(let r = 0; r < this.rules.clauses[cell_state].length; r++) {
                    let rule = this.rules.clauses[cell_state][r];

                    if (!rule.do_evaluation)
                        continue rule_loop;
                    
                    let truth_value = rule.evaluate(neighborhood_dict);
                    if (truth_value) {
                        conjunction_check: 
                        while(rule.conjucted_with != null) {
                            rule = rule.conjucted_with;
                            truth_value = rule.evaluate(neighborhood_dict);

                            if (!truth_value) {
                                break conjunction_check;
                            }
                        }
                    }
                    if (truth_value) {
                        next_grid[y][x] = rule.transform_state;
                        s_counts_new[next_grid[y][x]] += 1;

                        break rule_loop;
                    }
                }
            }
        }

        this.state_counts = s_counts_new;

        this.grid = next_grid;
    }

    /**
     * Returns a string 
     * @param {string} row_delimiter The character by which cells should be spaced out
     * @param {string} column_delimiter The character by which cells should be spaced out
     * @returns {string} The integer value associated with the variable
     */
    asString = function(multiline=false,column_delimiter=",",row_delimiter="\n") {
        let s = "";
        for(var y = 0; y < this.height; y++) {
            for(var x = 0; x < this.width; x++) {
                s += this.grid[y][x] + (x < this.width - 1 ? column_delimiter : "");
            }
            s += row_delimiter
        }

        return s;
    }
}

exports.Ruleset = Ruleset;
exports.Clause = Clause;
exports.Grid = Grid;
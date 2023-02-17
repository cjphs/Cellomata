require("./simulator.js")

const Modes = {
    READ_STATES: 0,
    SKIP: 1,
    DEFINE_CONDITIONALS: 2,

    COLORS: 100
}

const SYNTAX_WITH           = ["with", "w/", "w"];
const SYNTAX_CHANCE         = ["chance", "probability", "prob", "%"];
const SYNTAX_BECOMES        = ["becomes:", "->", ":"];
const SYNTAX_AND            = ["and", "&"]

const SYNTAX_SIM_WIDTH      = ["@width", "@w"];
const SYNTAX_SIM_HEIGHT     = ["@height", "@h"];
const SYNTAX_SIM_WRAP       = ["@wrap"];
const SYNTAX_SIM_COLOURS    = ["@colors", "@colours"];

let state_cols = {}
let reset_grid = false;
let recalc_grid_size = false;

let states = [];

let variables = {};

interpretRules = function(rule_string) {
    let interpreter_state = Modes.READ_STATES;

    let ruleset = null;

    let state_being_defined = "";

    variables = {};

    state_cols = {}

    recalc_grid_size = false;

    // Split input into array of strings
    lines = rule_string.split("\n");

    lines.forEach(line => {
        if (line.charAt(0) != "#" && line.trim() != "") {

            switch(interpreter_state) {

                case Modes.READ_STATES:
                    let new_states = line.replaceAll(" ","").split(",");

                    var state_count = 0;
                    new_states.forEach(ns => {
                        if (states.includes(ns))
                            state_count++;
                    });
                    reset_grid = !(state_count == states.length);

                    states = new_states;
                    ruleset = new Ruleset(states);

                    interpreter_state = Modes.SKIP;
                    break;

                case Modes.COLORS:
                    var cols = line.replaceAll(" ","").split(",");
                    var i = 0;
                    states.forEach(s => {
                        state_cols[s] = cols[i++];
                    })
                    interpreter_state = Modes.SKIP;
                    break;

                case Modes.SKIP:
                    elements = line.split(" ");

                    if (checkSyntaxPart(elements[0], SYNTAX_SIM_WIDTH)) {
                        var w;

                        if (elements[1] in variables)
                            w = parseInt(variables[elements[1]]);
                        else
                            w = parseInt(elements[1]);

                        if (w != grid_width) {
                            grid_width = w;
                            reset_grid = true;
                            recalc_grid_size = true;
                        }
                    }else if (checkSyntaxPart(elements[0], SYNTAX_SIM_HEIGHT)) {
                        var h;

                        if (elements[1] in variables)
                            h = parseInt(variables[elements[1]]);
                        else
                            h = parseInt(elements[1]);

                        if (h != grid_height) {
                            grid_height = h;
                            reset_grid = true;
                            recalc_grid_size = true;
                        }
                    }

                    else if (checkSyntaxPart(elements[0], SYNTAX_SIM_WRAP)) {
                        var wrap = (elements[1] === 'true');

                        if (CA_grid != null) {
                            CA_grid.wrap = wrap;
                        }
                    }

                    if (checkSyntaxPart(elements[0], SYNTAX_SIM_COLOURS))
                        interpreter_state = Modes.COLORS

                    else if (elements.length > 1 && checkSyntaxPart(elements[1], SYNTAX_BECOMES)) {
                        state_being_defined = elements[0];
                        interpreter_state = Modes.DEFINE_CONDITIONALS;
                    
                    // new variable
                    } else if (elements.length > 1 & elements[1] == "=") {
                        variables[elements[0]] = elements[2];
                        console.log(variables);
                    }

                    break;

                case Modes.DEFINE_CONDITIONALS:
                    interpreterLog("DEFINE_CONDITIONALS");

                    elements = line.split(" ");

                    console.log(elements[elements.length-1].slice(-1));

                    var termination = false;
                    
                    if (elements[elements.length-1].slice(-1) == ".") {
                        interpreterLog("TERMINATION " + elements[0]);
                        if (elements.length == 1)
                            elements[0] = elements[0].slice(0, -1);

                        termination = true;
                    }

                    var chance = 1;
                    if (elements.length > 1 && checkSyntaxPart(elements[1], SYNTAX_WITH)) {
                        if (checkSyntaxPart(elements[2], SYNTAX_CHANCE)) {
                            interpreterLog("CHANCE");
                            if (elements[3] in variables)
                                elements[3] = variables[elements[3]];
                            chance = parseFloat(elements[3]);
                            elements.splice(1,3);
                        }
                    }

                    if (elements.length > 1 && elements[1] == "if") {
                        interpreterLog("IF");
                        var done = false;

                        var prev_transform = null;

                        while(!done) {
                            var locality = elements[2].split("*");

                            let locality_state = "";
                            let locality_count = -1;
                            let equality = "=";

                            let locality_min = 0;
                            let locality_max = 9;

                            let r = checkValue(locality[0]);

                            locality_min = r[0];
                            locality_max = r[1];

                            locality_state = locality[1];

                            locality_type = elements[3];

                            let transform = new Transformation(elements[0], locality_type, locality_state, locality_count, chance, locality_check_min=locality_min, locality_check_max=locality_max);
                           
                            console.log(locality_min + " " + locality_max);
                            transform.equality_type = equality;

                            ruleset.addRule(state_being_defined, transform);

                            if (prev_transform != null) {
                                prev_transform.conjunctWith(transform);
                                transform.do_evaluation = false;
                            }

                            if (elements.length > 4 && checkSyntaxPart(elements[4], SYNTAX_AND)) {
                                prev_transform = transform;
                                elements.splice(2,3);
                            } else {
                                done = true;
                            }
                        }
                    } else {
                        ruleset.addRule(state_being_defined, new Transformation(elements[0], "always", "", -1, chance));
                    }

                    if (termination) {
                        interpreter_state = Modes.SKIP;
                    }

                    break;
            }
        }
    });

    return ruleset;
}

/**
 * This function receives a string value and checks if it represents some kind of value (number? range? variable?)
 * @param {string} val The value to be checked (does this represent a variable/number/range?)
 * @returns {[number,number]} range of minimum value & maximum value
 */
function checkValue(val) {
    let min_value, max_value;
    
    // Range
    if (val[0] == "[" && val[val.length-1] == "]") {
        val = val.substring(1, val.length - 1);
        val = val.split(",");

        min_value = checkVariable(val[0]);
        max_value = checkVariable(val[1]);

    // Inequalities
    } else if (val[0] == ">" || val[0] == "<") {
        let eq = (val[1] == "=")
        let inequality_type = val[0];
        
        val = val.substring((eq ? 2 : 1), val.length)

        if (inequality_type == ">") {
            min_value = checkVariable(val);
            max_value = Infinity;
            
            if (!eq)
                min_value += 1;

        } else if (inequality_type == "<") {
            min_value = 0;
            max_value = checkVariable(val)

            if (!eq)
                max_value += 1;
        }
    }

    // single integer value
    else {
        min_value = checkVariable(val);
        max_value = min_value;
    }

    return [min_value, max_value];
}

/**
 * Check if a symbol exists as a variable known to the interpreter.
 * @param {string} value Potential variable name
 * @returns {number} The integer value associated with the variable
 */
function checkVariable(value) {
    if (value in variables)
        return parseInt(variables[value]);
    else
        return parseInt(value);
}

/**
 * Check if a particular token belongs to a list of syntax tokens (e.g., "->" and "becomes:" are both valid for rule declarations).
 * @param {string} part Syntax token
 * @param {Array} syntax_list The constant syntax list of which to check membership
 * @returns {boolean} True if 'part' is in 'syntax_list'. 
 */
checkSyntaxPart = function(part, syntax_list) {
    var t = syntax_list.includes(part.toLowerCase());
    return t;
}

function interpreterLog(s) {
    console.log("INTERPRETER: " + s);
}
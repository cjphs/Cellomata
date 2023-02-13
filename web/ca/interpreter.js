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

interpretRules = function() {
    var inputbox = document.getElementById("rule_input_box");

    var interpreter_state = Modes.READ_STATES;

    var ruleset = null;

    var state_being_defined = "";

    variables = {};

    state_cols = {}

    recalc_grid_size = false;

    // clean up
    lines = inputbox.value.split("\n");

    lines.forEach(line => {
        if (line.charAt(0) != "#") {
            switch(interpreter_state) {
                case Modes.READ_STATES:
                    var new_states = line.split(", ");

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
                    var cols = line.split(", ")
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

                        console.log("help me");

                        while(!done) {
                            var locality = elements[2].split("*");

                            console.log("wtf");

                            let locality_state = "";
                            let locality_count = -1;
                            let equality = "=";

                            let locality_min = 0;
                            let locality_max = 9;

                            let r = checkValue(locality[0]);

                            console.log("FFFFF");
                            console.log(r);

                            locality_min = r[0];
                            locality_max = r[1];

                            locality_state = locality[1];

                            locality_type = elements[3];

                            // if (locality.length == 1) {
                            //     locality_state = elements[2];
                            // } else {
                            //     let 
                                // } else if (locality[0][0] == ">") {
                                //     equality = locality[0][0];
                                //     locality[0] = locality[0].slice(1);

                                //     if (locality[0] in variables)
                                //         locality[0] = variables[locality[0]];

                                //     locality_min = parseInt(locality[0]);
                                // } else if (locality[0][0] == "<") {
                                //     equality = locality[0][0];
                                //     locality[0] = locality[0].slice(1);

                                //     if (locality[0] in variables)
                                //         locality[0] = variables[locality[0]];

                                //     locality_max = parseInt(locality[0]);
                                // } else {
                                //     // TODO: Check if locality = number
                                //     locality_min = locality[0];
                                //     locality_max = locality[0];
                                // }

                            //    
                            // }

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

    console.log(ruleset);

    return ruleset;
}

// Check string to see if it's an integer or an integer range
function checkValue(val) {
    let min_value, max_value;

    // range
    if (val[0] == "[" && val[val.length-1] == "]") {
        val = val.substring(1, val.length - 1);
        val = val.split(",");

        console.log("test");
        console.log(val);

        min_value = checkVariable(val[0].trim());
        max_value = checkVariable(val[1].trim());

    // TODO
    } else if (val[0] == ">") {
        max_value = Infinity;

    } else if (val[0] == "<") {
        min_value = 0;
    }

    // single integer value
    else {
        min_value = checkVariable(val);
        max_value = min_value;
    }

    return [min_value, max_value];
}

function checkVariable(value) {
    if (value in variables)
        value = variables[value];
    else
        return parseInt(value);
    return value;
}



checkSyntaxPart = function(part, syntax_list) {
    var t = syntax_list.includes(part.toLowerCase());
    
    return t;
}

function interpreterLog(s) {
    console.log("INTERPRETER: " + s);
}
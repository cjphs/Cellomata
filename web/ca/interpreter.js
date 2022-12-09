const Modes = {
    READ_STATES: 0,
    SKIP: 1,
    DEFINE_CONDITIONALS: 2,

    COLORS: 100
}

let state_cols = {}
let reset_grid = false;

let states = [];

interpretRules = function() {
    var inputbox = document.getElementById("rule_input_box");

    var interpreter_state = Modes.READ_STATES;

    var ruleset = null;

    var state_being_defined = "";

    var variables = {};

    state_cols = {}

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

                    if (elements[0] == "@colors")
                        interpreter_state = Modes.COLORS

                    else if (elements.length > 1 & elements[1] == "becomes:") {
                        state_being_defined = elements[0];
                        interpreter_state = Modes.DEFINE_CONDITIONALS;
                    
                    // new variable
                    } else if (elements.length > 1 & elements[1] == "=") {
                        variables[elements[0]] = elements[2];
                        console.log(variables);
                    }

                    break;

                case Modes.DEFINE_CONDITIONALS:
                    elements = line.split(" ");

                    console.log(elements[elements.length-1].slice(-1));

                    var termination = false;
                    
                    if (elements[elements.length-1].slice(-1) == ".") {
                        if (elements.length == 1)
                            elements[0] = elements[0].slice(0, -1);

                        termination = true;
                    }

                    var chance = 1;
                    if (elements.length > 1 && elements[1] == "with") {
                        if (elements[2] == "chance") {
                            if (elements[3] in variables)
                                elements[3] = variables[elements[3]];
                            chance = parseFloat(elements[3]);
                            elements.splice(1,3);
                        }
                    }

                    if (elements.length > 1 && elements[1] == "if") {
                        var done = false;

                        var prev_transform = null;

                        while(!done) {
                            var locality = elements[2].split("*");
                            var locality_state = "";
                            var locality_count = -1;
                            var equality = "=";

                            if (locality.length == 1) 
                                locality_state = elements[2];
                            else {
                                if (locality[0][0] == ">" || locality[0][0] == "<") {
                                    equality = locality[0][0];
                                    locality[0] = locality[0].slice(1);
                                }
                                
                                // get value from variables
                                if (locality[0] in variables)
                                    locality[0] = variables[locality[0]];

                                locality_count = parseInt(locality[0]);
                                locality_state = locality[1];
                            }

                            var locality_type = elements[3];

                            var transform = new Transformation(elements[0], locality_type, locality_state, locality_count, chance);
                            transform.equality_type = equality;

                            ruleset.addRule(state_being_defined, transform);

                            if (prev_transform != null) {
                                prev_transform.conjunctWith(transform);
                                transform.do_evaluation = false;
                            }

                            if (elements.length > 4 && elements[4] == "and") {
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
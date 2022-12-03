const Modes = {
    READ_STATES: 0,
    SKIP: 1,
    DEFINE_CONDITIONALS: 2,

    COLORS: 100
}

state_cols = {}

interpretRules = function() {
    var inputbox = document.getElementById("rule_input_box");

    var interpreter_state = Modes.READ_STATES;

    var states = [];
    var ruleset = null;

    var state_being_defined = "";

    state_cols = {}

    // clean up
    lines = inputbox.value.split("\n");

    lines.forEach(line => {
        if (line.charAt(0) != "#") {
            switch(interpreter_state) {
                case Modes.READ_STATES:
                    states = line.split(", ");
                    ruleset = new Ruleset(states);

                    // apply states to editor
                    var states_combobox = document.getElementById("edit_box");
                    states_combobox.innerHTML = "";
                    
                    states.forEach(s => {
                        states_combobox.innerHTML += "<option value='" + s + "'>" + s + "</option>";
                    });

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

                        console.log(state_being_defined);
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
                            chance = parseFloat(elements[3]);
                            elements.splice(1,3);
                        }
                    }

                    if (elements.length > 1 && elements[1] == "if") {
                        var locality = elements[2].split("*");
                        var locality_state = "";
                        var locality_count = -1;

                        console.log(locality);

                        if (locality.length == 1) 
                            locality_state = elements[2];
                        else {
                            locality_count = parseInt(locality[0]);
                            locality_state = locality[1];
                        }

                        var locality_type = elements[3];

                        var transform = new Transformation(elements[0], locality_type, locality_state, locality_count, chance);

                        ruleset.addRule(state_being_defined, transform);
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
        
    console.log(lines);

    console.log(ruleset);

    return ruleset;
}
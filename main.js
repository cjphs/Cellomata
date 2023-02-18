const CA = require("./ca/")

// Define the automaton
let rule_string = 
    `V, A, _

    V ->
    A with chance .5
    _.

    _ ->
    A if 3*A nearby
    _.

    A ->
    A if [2,3]*A nearby
    _.`

let rules = CA.interpreter.interpretRules(rule_string);


let grid = new CA.simulator.Grid(10, 10, rules);

let i = 0;
let max_gens = 100;

while(i++ < max_gens) {
    grid.evolve();

    let s = grid.asString(multiline=false,column_delimiter="");
    console.log(grid.getStateCounts());
    

    console.log(s);
}

console.log("Done!");
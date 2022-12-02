const canvas = document.getElementById("grid_canvas");
const ctx = canvas.getContext('2d');

let grid_width = 30;
let grid_height = 30;

let cell_width = 20;
let cell_height = 20;

function draw() {
    for(var y = 0; y < grid_height; y++) {
        for(var x = 0; x < grid_width; x++) {
            ctx.fillStyle = state_cols[CA_grid.getCellState(x,y)];
            ctx.fillRect(cell_width*x, cell_height*y, cell_width, cell_height);
            
            ctx.strokeRect(cell_width*x, cell_height*y, cell_width, cell_height);
        }
    }
}

let mouse_down = false;
canvas.addEventListener('mousedown', function() {mouse_down = true}, false);
canvas.addEventListener('mouseup', function() {mouse_down = false}, false);

canvas.addEventListener('mousemove', e => {
    if (mouse_down) {
        // https://stackoverflow.com/a/42111623
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.

        var cx = Math.floor(x/cell_width);
        var cy = Math.floor(y/cell_height);

        console.log(cx);

        CA_grid.setCellState(cx, cy, CA_grid.rules.states[1]);
        draw();
    }
}, false);

let CA_states = ["Dead", "Alive"];
let state_cols = {
    "Dead": "white",
    "Alive": "black"
}

let CA_rules = new Ruleset(CA_states);

// CA_rules.addRule("dead", new Transformation("alive","nearby","alive", 3,1));
// CA_rules.addRule("dead", new Transformation("dead","always"));

// CA_rules.addRule("alive", new Transformation("alive", "nearby", "alive", 2));
// CA_rules.addRule("alive", new Transformation("alive", "nearby", "alive", 3));
// CA_rules.addRule("alive", new Transformation("dead", "always"));

let CA_grid = new Grid(grid_width, grid_height, CA_rules);

CA_grid.setCellState(10,10, "Alive");
CA_grid.setCellState(11,10, "Alive");
CA_grid.setCellState(12,10, "Alive");
CA_grid.setCellState(10,9,  "Alive");
CA_grid.setCellState(11,8,  "Alive");

console.log(CA_grid);

draw();

evolveDraw = function() {
    CA_grid.evolve();
    draw();
}

updateRules = function() {
    var CA_rules = interpretRules();
    CA_grid.rules = CA_rules;
}
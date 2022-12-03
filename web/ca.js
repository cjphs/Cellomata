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


// CA_rules.addRule("dead", new Transformation("alive","nearby","alive", 3,1));
// CA_rules.addRule("dead", new Transformation("dead","always"));

// CA_rules.addRule("alive", new Transformation("alive", "nearby", "alive", 2));
// CA_rules.addRule("alive", new Transformation("alive", "nearby", "alive", 3));
// CA_rules.addRule("alive", new Transformation("dead", "always"));

let CA_grid = null;

let playing = false;

frame = 0;

play = function() {
    if (playing) {
        if (frame++ % 10 == 0) 
            evolveDraw();
        
        requestAnimationFrame(play);
    }
}

evolveDraw = function() {
    CA_grid.evolve();
    draw();
}

updateRules = function() {
    var CA_rules = interpretRules();

    if (CA_grid == null)
        CA_grid = new Grid(grid_width, grid_height, CA_rules);
    else
        CA_grid.rules = CA_rules;

    playing = false;

    CA_grid.resetGrid();
}

updateRules();
draw();

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

        console.log(document.getElementById("edit_box").value);

        CA_grid.setCellState(cx, cy, document.getElementById("edit_box").value);
        draw();
    }
}, false);
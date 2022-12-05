const canvas = document.getElementById("grid_canvas");
const ctx = canvas.getContext('2d');

let grid_width = 50;
let grid_height = 50;

let cell_width = canvas.clientWidth/grid_width;
let cell_height = canvas.clientHeight/grid_height;

let CA_grid = null;
let playing = false;

let frame = 0;

function draw() {
    for(var y = 0; y < grid_height; y++) {
        for(var x = 0; x < grid_width; x++) {
            ctx.fillStyle = state_cols[CA_grid.getCellState(x,y)];
            ctx.fillRect(cell_width*x, cell_height*y, cell_width, cell_height);
            
            ctx.strokeRect(cell_width*x, cell_height*y, cell_width, cell_height);
        }
    }
}

play = function() {
    if (playing) {
        if (frame++ % 10 == 0) 
            evolveDraw();
        
        requestAnimationFrame(play);
    }
}

cssAnim = function(element, animation) {
    var canv = document.getElementById(element)
    canv.style.animation = 'none';
    canv.offsetWidth;
    canv.style.animation = animation; 
}

updateRules = function(reset=false) {
    var CA_rules = interpretRules();

    if (CA_grid == null)
        CA_grid = new Grid(grid_width, grid_height, CA_rules);
    else
        CA_grid.rules = CA_rules;

    if (reset_grid || reset) {
        CA_grid.resetGrid(only_override_nonexistant_states=true);
        draw();
    }

    cssAnim("grid_canvas", "rules_save 1s")
}

evolveDraw = function() {
    CA_grid.evolve();
    draw();
}

updateRules(true);
draw();


/////////////////
// Event stuff //
/////////////////

document.onkeydown = function (e) {
    e = e || window.event; //Get event
   
    if (!e.ctrlKey) return;
   
    switch (code) {
        case 83: // CTRL + S
            updateRules();
            draw();
            
            e.preventDefault();
            e.stopPropagation();
            break;

        case 88:
            CA_grid.resetGrid();
            draw();
            cssAnim("grid_canvas", "grid_clear 1s");
            break;
    }
}; 

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


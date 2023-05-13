const canvas = document.getElementById("grid_canvas");
const ctx = canvas.getContext('2d');

let grid_width = 64;
let grid_height = 64;

let cell_width = canvas.clientWidth/grid_width;
let cell_height = canvas.clientHeight/grid_height;

function recalculateGridSize() {
    pause();

    cell_width = canvas.clientWidth/grid_width;
    cell_height = canvas.clientHeight/grid_height;

    CA_grid.width = grid_width;
    CA_grid.height = grid_height;

    resetGrid(CA_rules,false);
}

let CA_grid = null;
let playing = false;

let frame = 0;

let selected_cell_state = "";
let selected_cell_element = null;

function draw() {
    if (CA_grid == null)
        return;
        
    for(var y = 0; y < grid_height; y++) {
        for(var x = 0; x < grid_width; x++) {
            ctx.fillStyle = state_cols[CA_grid.getCellState(x,y)];
            ctx.fillRect(Math.floor(cell_width*x), Math.floor(cell_height*y), Math.ceil(cell_width), Math.ceil(cell_height));
            
            // ctx.strokeRect(cell_width*x, cell_height*y, cell_width, cell_height);
        }
    }
}

pauseUnpause() = function() {
    if (playing)
        pause();
    else
        unpause();
}

pause() = function() {
    playing = false;
    document.getElementById("play-button").innerHTML = "Play";
}

unpause() = function() {
    playing = true;
    document.getElementById("play-button").innerHTML = "Pause";
}

play = function() {
    if (!playing)
        return;
    
    if (frame++ % 10 == 0) {
        evolveDraw();
    }

    requestAnimationFrame(play);
}

cssAnim = function(element, animation) {
    var canv = document.getElementById(element)
    canv.style.animation = 'none';
    canv.offsetWidth;
    canv.style.animation = animation; 
}

selectCellState = function(state) {
    if (selected_cell_element != null)
        selected_cell_element.style.boxShadow = "none";

    selected_cell_element = document.getElementById(state);
    selected_cell_element.style.boxShadow = "white 0 0 10px";
    selected_cell_state = state;
}

let CA_rules = null;

updateRules = function(reset=false) {
    CA_rules = interpretRules(document.getElementById("rule_input_box").value);

    var states_box = document.getElementById("state_picker");
    
    states_box.innerHTML = "";
                    
    CA_rules.states.forEach(s => {
        states_box.innerHTML += ("<div id='" + s + "' class='state' style='background-color: " + state_cols[s] + "' onclick='selectCellState(\"" + s + "\")'></div> ");
    });

    if (CA_grid == null)
        CA_grid = new Grid(grid_width, grid_height, CA_rules);
    else
        CA_grid.rules = CA_rules;

    if (reset_grid || reset) {
        if (recalc_grid_size)
            recalculateGridSize();

        resetGrid(CA_rules);
    } else {
        selectCellState(selected_cell_state);
    }

    cssAnim("grid_canvas", "rules_save 1s")
}

resetGrid = function(CA_rules,existent_states=true) {
    CA_grid.resetGrid(only_override_nonexistant_states=existent_states);
    selectCellState(CA_rules.getDefaultState());
    draw();
}

evolveDraw = function() {
    CA_grid.evolve();
    draw();
}

draw();


/////////////////
// Event stuff //
/////////////////

document.onkeydown = function (e) {
    e = e || window.event; //Get event
   
    if (!e.ctrlKey) return;
    
    var code = e.which || e.keyCode;//Get key code
   
    switch (code) {
        case 83:
        case 87:
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

        CA_grid.setCellState(cx, cy, selected_cell_state);

        draw();
    }
}, false);


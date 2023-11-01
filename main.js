import { Grid } from './src/simulator.js'
import { presetRulesets } from './src/presets.js'

const canvas = document.getElementById('grid_canvas')
const ctx = canvas.getContext('2d')

const gridWidth = 64
const gridHeight = 64

let cellWidth = canvas.clientWidth / gridWidth
let cellHeight = canvas.clientHeight / gridHeight

function recalculateGridSize () {
  pause()

  cellWidth = canvas.clientWidth / gridWidth
  cellHeight = canvas.clientHeight / gridHeight

  CA_grid.width = gridWidth
  CA_grid.height = gridHeight

  resetGrid(CA_rules, false)
}

let CA_grid = null
let playing = false

let frame = 0

let selectedCellState = ''
let selectedCellElement = null

const draw = function () {
  if (CA_grid == null) { return }

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      ctx.fillStyle = stateCols[CA_grid.getCellState(x,y)];
      ctx.fillRect(
        Math.floor(cellWidth * x),
        Math.floor(cellHeight * y),
        Math.ceil(cellWidth),
        Math.ceil(cellHeight)
      )
    }
  }
}

const pauseUnpause = function () {
  if (playing) {
    pause()
  } else {
    unpause()
  }
}

const pause = function () {
  playing = false
  document.getElementById('play-button').innerHTML = 'Play'
}

const unpause = function () {
  playing = true
  document.getElementById('play-button').innerHTML = 'Pause'
}

const play = function () {
  if (!playing) { return }

  if (frame++ % 10 === 0) {
    evolveDraw()
  }

  requestAnimationFrame(play)
}

const cssAnim = function (element, animation) {
  const canv = document.getElementById(element)
  canv.style.animation = 'none'
  canv.offsetWidth
  canv.style.animation = animation
}

const selectCellState = function (state) {
  if (selectedCellElement != null) {
    selectedCellElement.style.boxShadow = 'none'
  }

  selectedCellElement = document.getElementById(state)
  selectedCellElement.style.boxShadow = 'white 0 0 10px'
  selectedCellState = state
}

let CA_rules = null

const updateRules = function (reset = false) {
  CA_rules = interpretRules(document.getElementById('rule_input_box').value)

  const statesBox = document.getElementById('state_picker')

  statesBox.innerHTML = ''

  CA_rules.states.forEach(s => {
    statesBox.innerHTML += ("<div id='" + s + "' class='state' style='background-color: " + stateCols[s] + "' onclick='selectCellState(\"" + s + "\")'></div> ")
  });

  if (CA_grid == null) {
    CA_grid = new Grid(gridWidth, gridHeight, CA_rules)
  }
  else {
    CA_grid.rules = CA_rules;
  }

  if (reset) {
    if (recalcGridSize) { recalculateGridSize() }

    resetGrid(CA_rules)
  } else {
    selectCellState(selectedCellState);
  }

  cssAnim('grid_canvas', 'rules_save 1s')
}

const clearGrid = function () {
  CA_grid.resetGrid()
  selectCellState(CA_grid.rules.getDefaultState())
  cssAnim('grid_canvas', 'grid_clear 1s')
  draw()
}

const resetGrid = function (CA_rules, existingStates = true) {
  CA_grid.resetGrid(only_override_nonexistant_states = existingStates)
  selectCellState(CA_rules.getDefaultState())
  draw()
}

const evolveDraw = function () {
  CA_grid.evolve()
  draw()
}

draw()

/*
Event stuff
*/

document.onkeydown = function (e) {
  e = e || window

  if (!e.ctrlKey) { return }

  switch (e.key) {
    case 's':
      updateRules()
      draw()

      e.preventDefault()
      e.stopPropagation()
      break

    case 'x':
      clearGrid()
      break
  }
}

let mouseDown = false
canvas.addEventListener('mousedown', function () { mouseDown = true }, false)
canvas.addEventListener('mouseup', function () { mouseDown = false }, false)

canvas.addEventListener('mousemove', e => {
  if (mouseDown) {
    // https://stackoverflow.com/a/42111623
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left // x position within the element.
    const y = e.clientY - rect.top // y position within the element.

    const cx = Math.floor(x / cellWidth)
    const cy = Math.floor(y / cellHeight)

    CA_grid.setCellState(cx, cy, selectedCellState)

    draw()
  }
}, false)

const loadPreset = function () {
  const selectedPreset = document.getElementById('template_selection_box').value
  document.getElementById('rule_input_box').innerHTML = presetRulesets.get(selectedPreset)
  updateRules(true)
}

loadPreset('life')

import { Grid } from './src/simulator.js'
import { interpretRules } from './src/interpreter.js'
import { presetRulesets } from './src/presets.js'

const canvas = document.getElementById('grid-canvas')
const ctx = canvas.getContext('2d')

const gridWidth = 64
const gridHeight = 64

let cellWidth = canvas.clientWidth / gridWidth
let cellHeight = canvas.clientHeight / gridHeight

function recalculateGridSize () {
  pause()

  cellWidth = canvas.clientWidth / gridWidth
  cellHeight = canvas.clientHeight / gridHeight

  grid.width = gridWidth
  grid.height = gridHeight

  resetGrid(rules, false)
}

let grid = null
let playing = false

let frame = 0

let selectedCellState = ''
let selectedCellElement = null

const draw = function () {
  if (grid == null) { return }

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      ctx.fillStyle = stateCols[grid.getCellState(x, y)]
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

let rules = null

const updateRules = function (reset = false) {
  rules = interpretRules (document.getElementById('rule_input_box').value)

  const statesBox = document.getElementById('state_picker')

  statesBox.innerHTML = ''

  rules.states.forEach(s => {
    statesBox.innerHTML += ("<div id='" + s + "' class='state' style='background-color: " + stateCols[s] + "' onclick='selectCellState(\"" + s + "\")'></div> ")
  });

  if (grid == null) {
    grid = new Grid(gridWidth, gridHeight, rules)
  }
  else {
    grid.rules = rules;
  }

  if (reset) {
    if (recalcGridSize) { recalculateGridSize() }

    resetGrid(rules)
  } else {
    selectCellState(selectedCellState);
  }

  cssAnim('grid_canvas', 'rules_save 1s')
}

const clearGrid = function () {
  grid.resetGrid()
  selectCellState(grid.rules.getDefaultState())
  cssAnim('grid_canvas', 'grid_clear 1s')
  draw()
}

const resetGrid = function (rules, existingStates = true) {
  grid.resetGrid(only_override_nonexistant_states = existingStates)
  selectCellState(rules.getDefaultState())
  draw()
}

const evolveDraw = function () {
  grid.evolve()
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

    grid.setCellState(cx, cy, selectedCellState)

    draw()
  }
}, false)

const loadPreset = function () {
  const selectedPreset = document.getElementById('template_selection_box').value
  document.getElementById('rule_input_box').innerHTML = presetRulesets.get(selectedPreset)
  updateRules(true)
}

loadPreset('life')

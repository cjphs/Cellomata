import { Grid } from './simulator.js'
import { interpretRules } from './interpreter.js'
import presetRulesets from './presets'

const canvas = document.getElementById('grid-canvas')
const ctx = canvas.getContext('2d')

let gridWidth = 64
let gridHeight = 64

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

let stateCols = {}

const draw = function () {
  console.log(grid)
  if (grid == null) { return }

  console.log(grid)

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
    play()
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
  console.log('frame')
  if (!playing) { return }

  if (frame++ % 10 === 0) {
    evolveDraw()
  }

  requestAnimationFrame(play)
}

const cssAnim = function (element, animation) {
  const canv = document.getElementById(element)
  if (canv == null) { return }
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
  const ruleString = document.getElementById('rule_input_box').value || rules
  if (ruleString == '') { return }

  const interpreted = interpretRules (ruleString)

  gridWidth = interpreted.gridWidth
  gridHeight = interpreted.gridHeight

  rules = interpreted.ruleset
  console.log(rules)

  stateCols = interpreted.stateCols

  console.log(interpreted)

  console.log('wah?')
  
  const statesBox = document.getElementById('state_picker')

  statesBox.innerHTML = ''
  rules.states.forEach(s => {
    const cellElement = document.createElement('div')
    cellElement.id = s
    cellElement.className = 'state'
    cellElement.style.backgroundColor = stateCols[s]
    
    cellElement.onclick = function () {
      selectCellState(s)
    }

    statesBox.appendChild(cellElement)
  });

  if (
    grid == null ||
    interpreted.gridWidth != grid.width ||
    interpreted.gridHeight != grid.height)
    {
    grid = new Grid(interpreted.gridWidth, interpreted.gridHeight, rules, stateCols, interpreted.wrap)
    recalculateGridSize()
  }
  else {
    grid.rules = rules;
  }

  console.log(grid)

  if (reset) {
    // if (recalcGridSize) { recalculateGridSize() }
    recalculateGridSize()
    resetGrid(rules)
  } else {
    selectCellState(selectedCellState);
  }

  cssAnim('grid_canvas', 'rules_save 1s')
}

const clearGrid = function () {
  grid.resetGrid()
  console.log('rerrr')
  selectCellState(grid.rules.getDefaultState())
  cssAnim('grid_canvas', 'grid_clear 1s')
  draw()
}

const resetGrid = function (rules, existingStates = true) {
  grid.resetGrid(existingStates)
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

const loadPreset = function (preset) {
  rules = presetRulesets.get(preset)
  console.log(rules)
  document.getElementById('rule_input_box').value = rules
  updateRules(true)
}

console.log('wuppa')

loadPreset('life')

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('step').addEventListener('click', function() {
    console.log("evolve")
    grid.evolve()
    console.log("draw")
    draw()
  })  
  document.getElementById('updateRules').addEventListener('click', updateRules)
  document.getElementById('clear-grid').addEventListener('click', clearGrid)
  document.getElementById('play-button').addEventListener('click', pauseUnpause)
})

export { updateRules, clearGrid, evolveDraw, pauseUnpause, play, recalculateGridSize, loadPreset }

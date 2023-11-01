const presetRulesets = new Map()

presetRulesets.set('life',
`Void, Dead, Alive
@colors
black, black, white

p = .2

Void ->
Alive with chance p
Dead otherwise.

Dead ->
Alive if 3*Alive nearby
Dead otherwise.

Alive ->
Alive if [2,3]*Alive nearby
Dead otherwise.

@width 100
@height 100
@wrap true`)

presetRulesets.set('rockpaperscissors',
`Nil, Rock, Paper, Scissors
@colors
black, red, yellow, orange

Nil ->
Rock with chance .3
Paper with chance .3
Scissors with chance .3
Nil.

t = 3
p = 1

Rock ->
Paper with prob p if >=t*Paper nearby
Rock otherwise.

Paper ->
Scissors with prob p if >=t*Scissors nearby
Paper otherwise.

Scissors ->
Rock with prob p if >=t*Rock nearby
Scissors otherwise.

@width 100
@height 100
@wrap true`)

presetRulesets.set('cave',
`Void, Air, Wall
@colors
black, white, black

p = .5

Void ->
Air with chance p
Wall.

q = .9

Air ->
Wall with prob q if >4*Wall nearby
Air.

Wall ->
Wall if >3*Wall nearby
Air.

@width 64
@height 64
@wrap true`
)

class Clause {
  constructor (
    transformState,
    localityCheckType,
    localityCheckState = '',
    localityCount = -1,
    chance = 1,
    localityRangeMin = 0,
    localityRangeMax = 9
  )

  {
    // End state of the cell, should this transformation be successful
    this.transformState = transformState

    // Mode of the locality check (nearby/always)
    this.localityCheckType = localityCheckType

    // State to look for in the locality check
    this.localityCheckState = localityCheckState

    // How many cells of the locality check state should be in the neighborhood (-1 = any amount but 0)
    this.localityCount = localityCount

    this.localityRangeMin = localityRangeMin

    this.localityRangeMax = localityRangeMax

    // Chance of the transformation occuring (for probabilistic CA)
    this.chance = chance

    // if not null, then this rule must be true with the next rule
    this.conjucted_with = null

    this.do_evaluation = true

    this.equality_type = '='
  }

  conjunctWith = function (transformation) {
    this.conjucted_with = transformation
  }

  // True -> Cell being investigated becomes the transformState.
  evaluate = function (neighborhoodDict) {
    if (Math.random() >= this.chance) { return false }

    switch (this.localityCheckType) {
      case 'always':
        return true

      case 'nearby':
        let n = neighborhoodDict[this.localityCheckState];

        return (this.localityRangeMin <= n) && (n <= this.localityRangeMax)

      case 'majority':
        let mostNeighborsCount = 0
        let mostNeighborsState = ''

        states.forEach(s => {
          if (neighborhoodDict[s] > mostNeighborsCount) {
            mostNeighborsCount = neighborhoodDict[s]
            mostNeighborsState = s
          }
        })

        return (mostNeighborsState === this.localityCheckState)

      // directional
      default:
        if (this.localityCount !== 0) {
          return (neighborhoodDict['*' + this.localityCheckType] === this.localityCheckState)
        } else {
          return (neighborhoodDict['*' + this.localityCheckType] !== this.localityCheckState)
        }
    }
  }
}

class Ruleset {
  constructor (states) {
    this.states = states
    this.clauses = {}

    this.states.forEach(s => {
      this.clauses[s] = []
    })

    console.log(this.states)
    console.log(this.clauses)
  }

  addRule = function (fromState, clause) {
    this.clauses[fromState].push(clause)
  }

  getDefaultState = function () {
    return this.states[0]
  }

  getStatesDict = function (defaultValue = 0) {
    const dict = {}
    this.states.forEach(s => {
      dict[s] = defaultValue
    })

    return dict
  }
}

class Grid {
  constructor (width, height, rules) {
    this.width = width
    this.height = height

    this.rules = rules

    this.wrap = true

    this.grid = this.getEmptyGrid()

    this.stateCounts = {}

    this.rules.states.forEach(s => {
      this.stateCounts[s] = 0
    })
  }

  // creates an empty with the default state
  getEmptyGrid = function () {
    const grid = [[]]
    for (let y = 0; y < this.height; y++) {
      grid[y] = []
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = this.rules.getDefaultState()
      }
    }
    return grid
  }

  getStateCounts = function () {
    return this.stateCounts
  }

  resetGrid = function (only_override_nonexistant_states = false) {
    if (!only_override_nonexistant_states) {
      this.grid = this.getEmptyGrid();
    } else {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (!this.rules.states.includes(this.getCellState(x, y))) {
            this.setCellState(x, y, this.rules.getDefaultState())
          }
        }
      }
    }
  }

  // Check if (x,y) are valid coordinates in the grid
  coordinatesInBounds = function(x,y) {
    return (x >= 0 & x < this.width & y >= 0 & y < this.height)
  }

  getCellState = function (x, y) {
    if (this.wrap) {
      x = (this.width + x) % this.width
      y = (this.height + y) % this.height
    }

    let state = ''
    if (this.coordinatesInBounds(x, y)) {
      state = this.grid[y][x]
    }
    return state
  }

  setCellState = function (x, y, state) {
    if (this.coordinatesInBounds(x, y)) {
      this.grid[y][x] = state
    }
  }

    // Evolve the grid by one step
    evolve = function() {
        var next_grid = this.getEmptyGrid();

        let s_counts_new = {};
        this.rules.states.forEach(s => {
            s_counts_new[s] = 0;
        })

        for(var y = 0; y < this.height; y++) {
            for(var x = 0; x < this.width; x++) {
                var cell_state = this.getCellState(x,y);

                next_grid[y][x] = cell_state;

                var neighborhoodDict = this.rules.getStatesDict();

                for(var i = x-1; i < x+2; i++) {
                    for(var j = y-1; j < y+2; j++) {
                        if ((i == x && j == y))
                            continue;
                        // if (this.coordinatesInBounds(i,j))
                        var state = this.getCellState(i,j);

                        if (state != "")
                            neighborhoodDict[state] += 1;
                    }
                }

                neighborhoodDict["*below"] = this.getCellState(x,y+1);
                neighborhoodDict["*above"] = this.getCellState(x,y-1);
                neighborhoodDict["*left"] = this.getCellState(x-1,y);
                neighborhoodDict["*right"] = this.getCellState(x+1,y);
                neighborhoodDict["*bottomleft"] = this.getCellState(x-1,y+1);
                neighborhoodDict["*bottomright"] = this.getCellState(x+1,y+1);
                neighborhoodDict["*topleft"] = this.getCellState(x-1,y-1);
                neighborhoodDict["*topright"] = this.getCellState(x+1,y-1);

                rule_loop:
                for(let r = 0; r < this.rules.clauses[cell_state].length; r++) {
                    let rule = this.rules.clauses[cell_state][r];

                    if (!rule.do_evaluation)
                        continue rule_loop;
                    
                    let truth_value = rule.evaluate(neighborhoodDict);
                    if (truth_value) {
                        conjunction_check: 
                        while(rule.conjucted_with != null) {
                            rule = rule.conjucted_with;
                            truth_value = rule.evaluate(neighborhoodDict);

                            if (!truth_value) {
                                break conjunction_check;
                            }
                        }
                    }
                    if (truth_value) {
                        next_grid[y][x] = rule.transformState;
                        s_counts_new[next_grid[y][x]] += 1;

                        break rule_loop;
                    }
                }
            }
        }

        this.stateCounts = s_counts_new;

        this.grid = next_grid;
    }

  /**
   * Returns a string
   * @param {string} row_delimiter The character by which cells should be spaced out
   * @param {string} column_delimiter The character by which cells should be spaced out
   * @returns {string} The integer value associated with the variable
   */
  asString = function (multiline = false, columnDelimiter = ',', rowDelimiter = '\n') {
    let s = ''
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        s += this.grid[y][x] + (x < this.width - 1 ? columnDelimiter : '')
      }
      s += rowDelimiter
    }

    return s
  }
}

const Modes = {
  READ_STATES: 0,
  SKIP: 1,
  DEFINE_CONDITIONALS: 2,

  COLORS: 100
}

const SYNTAX_WITH = ['with', 'w/', 'w']
const SYNTAX_CHANCE = ['chance', 'probability', 'prob', '%']
const SYNTAX_BECOMES = ['becomes:', '->', ':']
const SYNTAX_AND = ['and', '&']

const SYNTAX_SIM_WIDTH = ['@width', '@w']
const SYNTAX_SIM_HEIGHT = ['@height', '@h']
const SYNTAX_SIM_WRAP = ['@wrap']
const SYNTAX_SIM_COLOURS = ['@colors', '@colours']

let state_cols = {}
let reset_grid = false
let recalc_grid_size = false

let states = []

let variables = {}

const interpretRules = function (ruleString) {
  console.log(ruleString)

  let interpreterState = Modes.READ_STATES

  let ruleset = null

  let stateBeingDefined = ''

  variables = {}

  state_cols = {}

  recalc_grid_size = false

  const lines = ruleString.split('\n')

  lines.forEach(line => {
    line = line.trim()

    if (line.charAt(0) !== '#' && line.trim() !== '') {
      switch (interpreterState) {
        case Modes.READ_STATES:
          const newStates = line.replaceAll(' ', '').split(',')

          let stateCount = 0
          newStates.forEach(ns => {
            if (states.includes(ns))
              stateCount++
          })
          reset_grid = !(stateCount == states.length)

          states = newStates
          ruleset = new Ruleset(states)

          interpreterState = Modes.SKIP
          break

        case Modes.COLORS:
          const cols = line.replaceAll(' ','').split(',')
          let i = 0
          states.forEach(s => {
            state_cols[s] = cols[i++]
          })
          interpreterState = Modes.SKIP
          break

        case Modes.SKIP:
          elements = line.split(' ')

                if (checkSyntaxPart(elements[0], SYNTAX_SIM_WIDTH)) {
                    var w

                    if (elements[1] in variables)
                        w = parseInt(variables[elements[1]])
                    else
                        w = parseInt(elements[1])

                    if (w != grid_width) {
                        grid_width = w
                        reset_grid = true
                        recalc_grid_size = true
                    }
                }else if (checkSyntaxPart(elements[0], SYNTAX_SIM_HEIGHT)) {
                    var h

                    if (elements[1] in variables)
                        h = parseInt(variables[elements[1]])
                    else
                        h = parseInt(elements[1])

                    if (h != grid_height) {
                        grid_height = h
                        reset_grid = true
                        recalc_grid_size = true
                    }
                }

                else if (checkSyntaxPart(elements[0], SYNTAX_SIM_WRAP)) {
                    var wrap = (elements[1] === 'true')

                    if (CA_grid != null) {
                        CA_grid.wrap = wrap
                    }
                }

                if (checkSyntaxPart(elements[0], SYNTAX_SIM_COLOURS))
                    interpreterState = Modes.COLORS

                else if (elements.length > 1 && checkSyntaxPart(elements[1], SYNTAX_BECOMES)) {
                    stateBeingDefined = elements[0]
                    interpreterState = Modes.DEFINE_CONDITIONALS
                
                // new variable
                } else if (elements.length > 1 & elements[1] == '=') {
                    variables[elements[0]] = elements[2]
                    console.log(variables)
                }

                break

            case Modes.DEFINE_CONDITIONALS:
                interpreterLog('DEFINE_CONDITIONALS')

                elements = line.split(' ')

                console.log(elements[elements.length-1].slice(-1))

                var termination = false
                
                if (elements[elements.length-1].slice(-1) == '.') {
                    interpreterLog('TERMINATION ' + elements[0])
                    if (elements.length == 1)
                        elements[0] = elements[0].slice(0, -1)

                    termination = true
                }

                var chance = 1
                if (elements.length > 1 && checkSyntaxPart(elements[1], SYNTAX_WITH)) {
                    if (checkSyntaxPart(elements[2], SYNTAX_CHANCE)) {

                        interpreterLog('CHANCE')

                        if (elements[3] in variables)
                            elements[3] = variables[elements[3]]
                        chance = parseFloat(elements[3])
                        elements.splice(1,3)
                    }
                }

                if (elements.length > 1 && elements[1] == 'if') {
                    interpreterLog('IF')

                    var done = false
                    var prev_transform = null

                    while(!done) {
                        var locality = elements[2].split('*')

                        let locality_state = ''
                        let locality_count = -1
                        let equality = '='

                        let locality_min = 1
                        let locality_max = 9
                        
                        if (locality.length > 1) {
                            let r = checkValue(locality[0])
                            
                            locality_min = r[0]
                            locality_max = r[1]

                            locality_state = locality[1]
                        } else {
                            locality_state = locality[0]
                        }

                        locality_type = elements[3]

                        let clause = new Clause(
                            elements[0],
                            locality_type,
                            locality_state,
                            locality_count,
                            chance,
                            locality_check_min=locality_min,
                            locality_check_max=locality_max
                        )

                        clause.equality_type = equality

                        ruleset.addRule(stateBeingDefined, clause)

                        if (prev_transform != null) {
                            prev_transform.conjunctWith(clause)
                            clause.do_evaluation = false
                        }

                        if (elements.length > 4 && checkSyntaxPart(elements[4], SYNTAX_AND)) {
                            prev_transform = clause
                            elements.splice(2,3)
                        } else {
                            done = true
                        }
                    }
                } else {
                    let clause = new Clause(elements[0], 'always', '', -1, chance)
                    ruleset.addRule(stateBeingDefined, clause)
                }

                if (termination) {
                    interpreterState = Modes.SKIP
                }

                break
        }
    }
  })

  return ruleset
}

function checkValue (val) {
  let minValue, maxValue

  // Range
  if (val[0] === '[' && val[val.length-1] === ']') {
    val = val.substring(1, val.length - 1)
    val = val.split(',')

    minValue = checkVariable(val[0])
    maxValue = checkVariable(val[1])
  } else if (val[0] === '>' || val[0] === '<') {
    const eq = (val[1] === '=')
    const inequalityType = val[0]

    val = val.substring((eq ? 2 : 1), val.length)

    if (inequalityType === '>') {
      minValue = checkVariable(val)
      maxValue = Infinity

      if (!eq) {
        minValue += 1
      }
    } else if (inequalityType === '<') {
      minValue = 0
      maxValue = checkVariable(val)

      if (!eq) {
        maxValue += 1
      }
    }
  } else {
  // single integer value
    minValue = checkVariable(val)
    maxValue = minValue
  }

  return [minValue, maxValue]
}

const checkVariable = function (value) {
  if (value in variables) {
    return parseInt(variables[value])
  } else {
    return parseInt(value)
  }
}

const checkSyntaxPart = function (part, syntaxList) {
  return syntaxList.includes(part.toLowerCase())
}

const interpreterLog = function (s) {
  console.log('INTERPRETER: ' + s)
}

// MAIN


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

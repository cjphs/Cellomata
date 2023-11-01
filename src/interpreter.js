import { Ruleset } from './simulator.js'

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

export { interpretRules }

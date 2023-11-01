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

export { presetRulesets, loadPreset }

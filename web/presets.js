const preset_rulesets = new Map();

preset_rulesets.set("life",
`Dead, Alive
@colors
black, white

@width 100
@height 100
@wrap true

Dead becomes:
Alive if 3*Alive nearby
Dead otherwise.

Alive becomes:
Alive if 2*Alive nearby
Alive if 3*Alive nearby
Dead otherwise.
`);

preset_rulesets.set("rock_paper_scissors",
`Nil, Rock, Paper, Scissors
@colors
black, red, orange, yellow

@width 100
@height 100
@wrap true

t = 3

Nil ->
Rock with prob .3
Paper with prob .3
Scissors with prob .3
Nil. 

Rock ->
Paper if >=t*Paper nearby
Rock.

Paper ->
Scissors if >=t*Scissors nearby
Paper.

Scissors ->
Rock if >=t*Rock nearby
Scissors.
`);
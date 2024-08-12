const rockpaperscissors = `Nil, Rock, Paper, Scissors
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
@wrap true`

export default rockpaperscissors

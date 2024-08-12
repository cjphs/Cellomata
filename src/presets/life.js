const life = `Void, Dead, Alive
@colors
black, black, white

Dead ->
Alive if 3*Alive nearby
Dead otherwise.

Alive ->
Alive if [2,3]*Alive nearby
Dead otherwise.

# populate empty grid
Void ->
Alive with chance 0.2
Dead otherwise.

@width 100
@height 100
@wrap true`

export default life

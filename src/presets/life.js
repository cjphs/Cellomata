const life = `Void, Dead, Alive
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
@wrap true`

export default life

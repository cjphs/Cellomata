const caves = `Void, Air, Wall
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

export default caves

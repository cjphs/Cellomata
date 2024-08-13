const caves = `Void, Air, Wall
@colors
black, white, black

q = .9

Air ->
Wall with prob q if >4*Wall nearby
Air.

Wall ->
Wall if >3*Wall nearby
Air.

# populate empty grid
Void ->
Air with chance 0.5
Wall.

@width 64
@height 64
@wrap true`;

export default caves;

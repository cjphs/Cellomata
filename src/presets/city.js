const city = `0, n, e, s, w, border, emitter
@colors
black, white, gray, white, gray, maroon, orange

0 becomes:
# n,e,s,w move as normally
n if emitter below
e if emitter left
s if emitter above
w if emitter right
n if n below
e if e left
s if s above
w if w right
# random off-shoots
n with chance .025 if e below
n with chance .025 if w below
s with chance .025 if e above
s with chance .025 if w above
e with chance .025 if n left
e with chance .025 if s left
w with chance .025 if n right
w with chance .025 if s right
border if 3*n nearby
border if 3*e nearby
border if 3*s nearby
border if 3*w nearby
emitter with chance 0.00025 if 8*0 nearby
0 otherwise.`

export default city

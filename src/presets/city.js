const city = `0, n, e, s, w, border, emitter
@colors
black, white, gray, white, gray, maroon, orange

0 becomes:
# n,e,s,w move as normally
n if emitter||n below
e if emitter||e left
s if emitter||s above
w if emitter||w right
# random off-shoots
n with chance .025 if e||w below
s with chance .025 if e||w above
e with chance .025 if n||s left
w with chance .025 if n||s right
border if 3*n||e||s||w nearby
emitter with chance 0.00025 if 8*0 nearby
0 otherwise.`;

export default city;

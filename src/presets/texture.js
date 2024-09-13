const texture = `0, 1, 2, 3, 4, 5
@colors
black, #880044, #660033, #440022, #220011, #111111

p = 0.25
q = .75
s = 0.001

0 becomes:
1 with chance s
(1,2) with chance (p,q) if (1,1) nearby
(2,3) with chance (p,q) if (2,2) nearby
(3,4) with chance (p,q) if (3,3) nearby
(4,5) with chance (p,q) if (4,4) nearby
5 with chance p if 5 nearby
0 otherwise.

1 becomes:
3 if 0*0 nearby and 0*1 nearby
1 otherwise.

@width 64
@height 64
@wrap true

`;

export default texture;

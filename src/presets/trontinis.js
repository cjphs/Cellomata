const trontinis = `
# TRON
# by cjphs

Void, Grid, RN, RE, RS, RW, Past, Past2
@colors
black, black, red, red, red, red, purple, navy

p = .1

Void ->
RN with chance p
RE with chance p
RW with chance p
RS with chance p
Grid.

# turn chance
q = .1

Grid ->
RE with chance q if 1*RN below
RW with chance q if 1*RN below
RE with chance q if 1*RS above
RW with chance q if 1*RS above
RN with chance q if 1*RE left
RS with chance q if 1*RE left
RN with chance q if 1*RW right
RS with chance q if 1*RW right
RN if 1*RN below
RE if 1*RE left
RS if 1*RS above
RW if 1*RW right
Grid.

RN ->
Past.

RE ->
Past.

RS ->
Past.

RW ->
Past.

Past ->
Past2.

Past2 ->
Grid.
`;

export default trontinis;

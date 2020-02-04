input format is:
`[[x1,y1,z1,x2,y2,z2,x3,y3,z3],[x4,y4,z4,x5,y5,z5,x6,y7,z7]]`

output would be:

`[x1,y1,z1,x2,y2,z2,x2,y2,z2,x3,y3,z3,x4,y4,z4,x5,y5,z5,x5,y5,z5,x6,y6,z6]`

when connected to simplespline this will draw 2 lines, each consting of 3 points ( in one draw call)
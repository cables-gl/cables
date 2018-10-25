Basic Lsystem explanation:
A string of characters (symbols) is rewritten on each iteration according to some replacement rules. 

All Lsystems need to have a 'Axiom/Seed'
At least 1 constant and 1 rule

#### Guide to symbols:

`F`	Move forward by 'step length' draw a line
`f`	Move forward by 'step length' without drawing a line
`x`	Rotate counter clockwise on the 'x axis' by the 'Default angle' amount 
`X`	Rotate clockwise on the 'y axis' by the 'Default angle' amount
`y`	Rotate counter clockwise on the 'y axis' by the 'Default angle' amount 
`Y`	Rotate clockwise on the 'y axis' by the 'Default angle' amount
`z`	Rotate counter clockwise on the 'z axis' by the 'Default angle' amount 
`Z`	Rotate clockwise on the 'Z axis' by the 'Default angle' amount
`[`	Push current position and rotation onto the stack (Starts a branch)
`]`	Pop current position and rotation from the stack (Closes a branch)
`>`	Multiply the line length by the 'Step scale Multiplier'
`<`	Divide the line length by the 'Step scale Multiplier'

Each rotation can also be assigned a different value than the 'Default Angle' by typing in the axis and then a number.

`x34.5 ` Will rotate -34.5 degrees on the x axis

User defined angles and default angles can be mixed together like this `FFx34.5FyzFx20.2 `

To create 2 branches: `FF[xFFyzF]F[yxFFyzF]`

To nest one branch inside another `FF[xFF[YzFF]fF]`

All branches must be closed to generate a valid string.

Check http://paulbourke.net/fractals/lsys/ for Rule sets and examples
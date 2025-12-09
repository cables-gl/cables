Basic Lsystem explanation:
An LSystem is a parallel string rewriting system. A string rewriting system consists of an initial string, called the seed, and a set of rules for specifying how the symbols in a string are rewritten as (replaced by) strings.

seed: A
rules: 
Rule #1: A = AB
Rule #2: B = BA

The LSystem starts with the seed ‘A’ and iteratively rewrites that string using the production rules. On each iteration a new string/word is derived.
n is the derivation length = the number of iterations

n=0: A
n=1: AB (A becomes AB according to Rule #1)
n=2: ABBA (A becomes AB according to Rule #1, while B becomes BA according to Rule #2. In result we get ABBA)
n=3: ABBABAAB
n=4: ABBABAABBAABABBA

All Lsystems need to have a 'Axiom/Seed' and at least 1 constant with 1 rule

The final string is then used to create a series of steps, rotations and scaling to geometry or a set of xyz points.

This op can be used with any geometry ops or with the pointCloud op and various spline ops.

#### Guide to symbols:

` F `	Move forward by 'step length' draw a line
` f `	Move forward by 'step length' without drawing a line
` x `	Rotate counter clockwise on the 'x axis' by the 'Default angle' amount 
` X `	Rotate clockwise on the 'y axis' by the 'Default angle' amount
` y `	Rotate counter clockwise on the 'y axis' by the 'Default angle' amount 
` Y `	Rotate clockwise on the 'y axis' by the 'Default angle' amount
` z `	Rotate counter clockwise on the 'z axis' by the 'Default angle' amount 
` Z `	Rotate clockwise on the 'Z axis' by the 'Default angle' amount
` [ `	Push current position and rotation onto the stack (Starts a branch)
` ] `	Pop current position and rotation from the stack (Closes a branch)
` > `	Multiply the line length by the 'Step scale Multiplier'
` < `	Divide the line length by the 'Step scale Multiplier'

Each rotation can also be assigned a different value than the 'Default Angle' by typing in the axis and then a number.

` x34.5 ` Will rotate -34.5 degrees on the x axis

User defined angles and default angles can be mixed together like this 
` FFx34.5FyzFx20.2 `

To create 2 branches: 
` FF[xFFyzF]F[yxFFyzF] `

To nest one branch inside another: 
` FF [xFF [YzFF] fF ] `

All branches must be closed to generate a valid string.
[FFxF]    / this will work
[FFXF     / this won't due to the missing close branch symbol

Check http://paulbourke.net/fractals/lsys/ for Rule sets and examples
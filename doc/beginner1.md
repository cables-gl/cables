



## beginner tutorial - part 1

first, we need a project to work with, so press the "new Project" button, or select a project from your dashboard.


### drawing a circle

to draw a circle, we need two operators:

1. the webgl renderer
2. a circle

### 1. add the webgl operator

- to create the first operator you press ```[esc]```
- the "select operator dialog" is showing
- now enter ```render```
- the first entry in the list should be "ops.gl.renderer"
- press ```[enter]``` to create the operator

### 2. add the circle operator

- to create a new operator and connect automatically it to another op you can pull the blue output port on the left side with your mouse.
- just drag it out of the operator and release your mouse button.

![](/doc/create_op_pull.gif)

- the "select operator dialog" is showing again
- enter ```circle```, now the entry ```ops.gl.meshes.circle``` should be selected, press ```[enter]``` to create it
- now it should look like this:

![](/doc/beginner1result.png)

### 3. parameters

- the renderer canvas (on the right side should show a circle now)
- the parameter panel shows all parameters to tweak the circle. 
- play around with the parameters, for example drag the slider "innerradius"

![](/doc/beginner1circle.png)



## part 2

[continue to part 2](/doc/beginner2)
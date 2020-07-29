
# Beginner 1: Drawing A Circle

First, we need a project to work with.If you're on the main webpage click the `Create` tab and then `Empty Project`.
If you're already in a patch click in the top left tab and select `New patch` then `empty`.

To draw a circle, we need two operators:

1. The `MainLoop`-op
2. A `Circle`-op

## 1.Add the WebGL-op

- To create an operator press `[esc]` – the `Select Operator`-dialog shows up
- Now type `Main`
- The first entry in the list should be [Ops.Gl.MainLoop](https://cables.gl/op/Ops.Gl.MainLoop)
- Press `[enter]` or click the `+` button to create the operator

## 2. Add The Circle Operator

- To create a new operator and automatically connect it to another op you can pull the yellow output port on the left side with your mouse (drag it out of the operator and release your mouse button).

![](img/create_main_loop_circle.gif)

- The `Select Operator`-dialog will appear
- Type `circle`, now the entry [Ops.Gl.Meshes.Circle](https://cables.gl/op/Ops.Gl.Meshes.Circle) should be selected
- Press `[enter]` or click the `+` button to create it

Now it should look like this:

![](img/beginner1result.png)

## 3. Parameters

- The renderer canvas (on the right side) now shows a circle
- The parameter panel shows all parameters to tweak the circle
- Play around with the parameters, for example drag the slider `innerradius`

![](img/beginner1circle.png)

## Part 2

Continue to [Part 2](../beginner2_transformations/beginner2_transformations) of the tutorial-series to learn how to use transformations.

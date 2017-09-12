
# More Transformations

[Back to part 3](../beginner3_color/beginner3_color.md)


To reuse the circle and draw multiple of them you can use `Ops.Repeat`

Add it like this:  

![](img/beginner_repeat1.png)

Now you still see one circle, but the `num`-parameter of `Repeat`-op has value `5`. The 5 circles are currently drawn at the exact same position. To change this, we need the `Transform`-op again:  

- Connect the new transform `x` port to the outgoing `index`-port of `Repeat`
- Now there will be 5 circles
- You may have to insert a new `Transform`-op __before__ the `Repeat`-op and adjust the position of them to see them all (use x/y/z transforms to center them)

It should look like this now:  

![](img/beginner_repeat2.png)

You can add another `Repeat`-op to make a 2D array of circles like this:  

![](img/beginner_repeat3.png)

With some more practice and adjustment it is possible to create a 3D cube of cubes. This example uses only two new ops: `matCapMaterial` and `cube`:

![](img/beginner_repeat4.png)


That’s it. You have finished the beginner tutorial series. Now you should have a look at the existing [examples](https://cables.gl/examples) and [public projects](https://cables.gl/projects) to learn more…
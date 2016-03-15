
## more transformations

[back to part 3](/doc/beginner3)


to reuse the circle and draw multiple of them you can use ops.repeat

- add it like this:

![](/imgdoc/beginner_repeat1.png)

now you still see one circle, but ```num``` parameter of repeat op has value '5'...
the 5 circles are currently drawn at the exact same position.
to change this, we need the ```transform``` op again:

- connect the new transform ```x``` port to the outgoing ```index``` port of repeat
- now there will be 5 circles
- you maybe have to insert a new transform op __before__ the repeat and adjust the position of them to see them all ( use x/y/z transforms to center them)

it should look like this now:

![](/imgdoc/beginner_repeat2.png)

- you can add another repeat to make a 2d array of circles like this:

![](/imgdoc/beginner_repeat3.png)


- with some more practice and adjustment it is possible to create a 3d cube of cubes like this:
- this example uses only two new ops: ```matCapMaterial``` and ```cube```

![](/doc/beginner_repeat4.png)

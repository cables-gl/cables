Outputs a harmonic color pallet. By changing the `Index` value, you will get another one. The resulting `Color Array` contains 15 values (5 × 3) – so 5 colors with a red, green and blue value between `0` and `1`.
The resulting array looks like this: `[c1red, c1green, c1blue, c2red, c2green, c2blue, …]`.
You probably want to connect the `Color Array` port to an Ops.Array.ArrayGetValue3x op, to get the r, g, and b values for one color out of the array.  


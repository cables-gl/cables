# Optimizing arrays

If you are working with arrays, (i.e. generating points or using audio FFT) try to keep the number of points as low as you possibly can.  Using a lot of array operations can become expensive. While we are doing our best to optimize our array ops regarding performance, when working with arrays with a lot of elements, things can become performance-intensive very quickly.

A general rule of thumb:

- try to prepare "static" data only once, and not every frame
- use Flow mode to identify ops that are populating arrays every frame

This op allows you to create trigger patterns in conjuction with the ParseArray op.

If your array contains a 0, the step containing it will not pass a trigger through.

If you do not pass an array, triggers will be passed through.

An example:
If you choose a step size of 6 and use an array that looks like this `[1, 0, 0, 0.5, 0, 0]`, every third step will be triggered. Step number 0 will output a "Sequenced Value" of `1`, where as step number 3 will output a value of `0.5`. These values can be used to modulate parameters, e.g.: using it to control the volume of a sequenced sound. Please refer to the example for a musical use case.
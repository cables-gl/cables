example
you have an array with 3 values [0,1,2]
and you want to have an array of with a length of 9 with these values
You pass the smaller array into FillArrayRandomDuplicates and define a length of 9
You'll then get something like [0,1,2,0,1,2,2,0,0]
Note that the original array that's passed in will always be in the start of the new array. In this case the 1st 3 values will always be 0,1,2
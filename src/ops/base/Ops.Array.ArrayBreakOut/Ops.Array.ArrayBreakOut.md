In a lot of cases you need to access multiple indexes of an array side by side, so you would connect a lot of Ops.Array.ArrayGetValue ops to the array with different indexes. 
`ArrayBreakOut` makes this a bit easier as it _breaks out_ the first 12 values of the array.   
If the input array is bigger than there are ports available the remaining values will be available in the `Rest Array`.
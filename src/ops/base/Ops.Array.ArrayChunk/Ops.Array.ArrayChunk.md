Creates a new array with `Chunk Size` elements starting from `Start Index`, copies the values from the input array (shallow copy).
If there are less elements in the array than `Chunk Size`, the size of the output array may be smaller.  

*Example 1: *  

- Input Array: `1, 2, 3, 4, 5`
- Start Index: `2`
- Chunk Size: `3`
- Output Array: `3, 4, 5`   
  
*Example 2: *  

- Input Array: `1, 2, 3, 4, 5`
- Start Index: `3`
- Chunk Size: `3`
- Output Array: `4, 5`  

ArrayChunk has a special mode – `Circular` – when set to `true`, elements from the beginning of the array will be included:

Example 3:  

- Input Array: `1, 2, 3`
- Start Index: `1`
- Chunk Size: `3`
- Circular: `true`
- Output Array: `2, 3, 1`  

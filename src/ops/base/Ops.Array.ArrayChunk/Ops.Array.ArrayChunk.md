# ArrayChunk

*Ops.Array.ArrayChunk*  

Makes a (shallow) copy of the `Input Array` which includes up to `Chunk Size` elements starting from `Start Index`.

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

`ArrayChunk` has a special mode – `Circular` – when set to `true`, elements from the beginning of the array will be included:

*Example 3:*  

- Input Array: `1, 2, 3`
- Start Index: `1`
- Chunk Size: `3`
- Circular: `true`
- Output Array: `2, 3, 1`  

## Input

### Begin Index [Number]

The index where the chunk should begin

### Chunk Size [Number]

How big the chunk should be, if there are not enough elements at the end of the `Input Array` the chunk will be smaller

## Output

### Output Array [Array]

Included `Chunk Size` elements or less




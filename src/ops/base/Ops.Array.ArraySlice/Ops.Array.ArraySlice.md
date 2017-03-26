# ArraySlice

*Ops.Array.ArraySlice*  

Extracts parts of an array.

*Example:* 

Input array: `[1, 2, 3, 4, 5]`  

After calling `Slice` with `Begin Index` = `0` and `End Index` = `4`:  `[1, 2, 3, 4]`

`Slice` is a wrapper around the JavaScript [slice](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) function.

## Input

### Input Array [Array]

The array your want to slice

### Begin Index [Number]

The index where the extraction should start. If `Begin Index` is negative it will extract elements from the end, e.g. when the `Input Array` is `[1, 2, 3]`, calling `Slice` with `Begin Index` `-1` will return `3`.

### End Index [Number]

The index where the extraction should end (exclusive, so this one will not be included in the `Output Array`)

## Output

### Output Array [Array]

A copy of the `Input Array` which only included values from `Start Index` until `End Index` (exclusive)
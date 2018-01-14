# ShuffleArray

*Ops.Array.ShuffleArray*

Shuffles an array, makes a copy of the original array before, the the original area stays unchanged.

## Input

### Execute [Trigger]

Shuffles the array

### Array [Array]

The array to shuffle

### Shuffle On Change [Bool]

When set, the array will be shuffled when the input array `Array` changes as well as when `Execute` was triggered. If not set the array will only be shuffled when `Execute` was triggered.

## Output

### Next [Trigger]

Triggers the next op (only when triggered by `Execute`)

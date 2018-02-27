If the array does not consist of triplets you probably want to use the regular `ArrayReverse` op.
e.g. `[x1, y1, z1, ..., x9, y9, z9]` —> `[x9, y9, z9, ..., x1, y1, z1]`
or: `[1, 2, 3, 4, 5, 6]` —> `[4, 5, 6, 1, 2, 3]`
If the input array has a bad length (not dividable by 3), e.g. `[1, 2, 3, 4, 5, 6, 7]` (length: 4) or `[1, 2, 3, 4, 5, 6, 7, 8]` (length: 5), the last values which cannot form a triple will be cut off, in both cases the reversed array would be `[4, 5, 6, 1, 2, 3]` (trimmed).

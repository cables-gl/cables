# JsonArray

*Ops.Json.JsonArray*

Returns an array from a JSON-object, can be used e.g. for third-party API requests

For example if you want to have the array `myArr`, you would pass in the JSON-object as well as the array-key `myArr`

```
{
    "myArr": [1, 3, 5, 7],
    ...
}
```

## Input

### Data

*Type: Object*  
The Json-object you want to extract an array from

### Key

*Type: Value*
The key of the array

## Output

### Result

*Type: Array*
A native array

### Length

*Type: Value*
The length of the array



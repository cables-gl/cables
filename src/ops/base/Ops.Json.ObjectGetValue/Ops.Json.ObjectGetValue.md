# JsonValue

*Ops.Json.jsonValue*   

Extracts a value from a JSON-object based on its key.  
E.g. if you have the following object:  

```
{
	"myVal": 123,
	"anotherVal": 456
}
```

Passing in `myVal` as `Key` would return `123`.

## Input

### Data

*Type: Object*  
The JSON-object you want to extract a value from

### Key

*Type: Value*
The key of the element you want to extract  

## Output

### Result

*Type: Value*
The value with the specified key extracted from the object



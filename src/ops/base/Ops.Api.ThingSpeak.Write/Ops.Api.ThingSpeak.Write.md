# Write

*Ops.Api.ThingSpeak.Write*  

Writes a value to [ThingSpeak](https://thingspeak.com).  

**Please note:** If you send data too often, it will fail.

## Input

### Write [Function]

### Field [String]

The field you want to write into – `field1`, `field2` and so on (this is not the field name!).

### Value [String]

The value you want to write

### Write API Key [String]

Your API key with write access

## Output

### When Finished [Function]

Triggers when the write command has finished

### Success [Bool]

Whether or not the write command succeeded

### Rows [Value]

The number of data-rows in your channel. After a successful write request this will be one bigger than before.
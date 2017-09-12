# ReadLastEntry

*Ops.Api.ThingSpeak.ReadLastEntry*  

Reads the last entry from a channel from [ThingSpeak](https://thingspeak.com), which can be used to store e.g. sensor data from a microcontroller like Arduino.

Check out the [API-documentation](https://de.mathworks.com/help/thingspeak/get-a-channel-feed.html)

## Input

### Read [Function]

Reads the last value from ThingSpeak

## Channel ID [value]

The ID of the channel you want to read data from

### Read API Key [String]

Put in your read API key here

## Output

### When Finished [Function]

Triggered when the read-command finished and the API sent some data back

### Last Entry [Object]

The last entry from your ThingSpeak channel
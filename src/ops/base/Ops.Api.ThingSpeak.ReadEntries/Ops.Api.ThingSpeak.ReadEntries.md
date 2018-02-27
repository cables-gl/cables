# ReadEntries

*Ops.Api.ThingSpeak.ReadEntries*  

Reads the most recent entries from [ThingSpeak](https://thingspeak.com)

## Input

### Read [Function]

Reads the data from ThingSpeak

### Channel ID [Number]

The channel ID you want to read from

### Read API Key [String]

You need to create an API key in order to access your channel

## Output

### When Finished [Function]

Triggered when the read command finished

### Entries [Array]

The entries of your channel as an Array of Objects

### Number Of Entries [Number]

The number of entries returned by the API

### Channel Infos [Object]

Some general infos about the channel (name, …).

### Success [Bool]

Whether or not the read succeeded
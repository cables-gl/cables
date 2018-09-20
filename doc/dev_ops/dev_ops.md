# Developing Ops

## Basic Setup

`op` is a pre-defined object which bundles all the functions you need to interact with the world of cables.

## Adding Ports and Port types

Different port examples below.

Value ports in and out:
```javascript
var inFloat = op.inValue("Value or float in");
var outFloat = op.outValue("Value or float out");
```
String ports in and out:
```javascript
var inString = op.inValueString("String in");
var outString = op.outValueString("String out");
```

Boolean ports in and out:
```javascript
var inBoolean = op.inValueBool("Boolean in");
var outBoolean = op.outValueBool("Boolean out");
```

Trigger ports in and out:
```javascript
var execute = op.inFunction("Trigger In");
var trigger = op.outFunction("Trigger out");
```
Array ports in and out:
```javascript
var inArray = op.inArray("Array in");
var outArray = op.outArray("Array out");
```

Object ports in and out:
```javascript
var inObject = op.inObject("Object In");
var outObject = op.outObject("Object Out");
```


See [Ports](../dev_creating_ports/dev_creating_ports.md)


### Op root

All the code you write inside your op will be executed once the patch is added to the patch-view, so all your initialisation-code should be in the root of your patch, e.g.

```javascript

var inPort = op.inValue("My Input Port");
var outPort = op.outValue("My Output Port");

// put your initialisation code here
...
```

If your op requires another library (e.g. `tone.min.js`) the library will already be loaded once your code is executed.

At this state the links between ops / the port-values are not set, yet, we will come to this later…

### port.onChange

For every input-port (except `inFunction` and `inFunctionButton`) you can implement the `onChange`-method which gets called every time the value on the port changes. This means that it is being called when:

- the user entered a new value in the GUI (input field / moved a slider / checkbox / …)
- Another op linked to this port
- A link was removed

When a link to a value or string-value port was removed the old value (from the form) will be set again. If the old value is the same as the value from the linked op `onChange` will **not** be called, so it is only called if the value actually changed.

If a connection to an object or array-port is removed the port will contain `null`.

Follow this [link](../dev_callbacks/dev_callbacks.md) for more information on Callbacks


### Naming Conventions

#### Op Names

UpperCamelCase, e.g. `KeyPressLearn` (`Ops.Devices.Keyboard.KeyPressLearn`). If your op has an abbreviation in it with multiple big letters in a row (e.g. `MIDI`), write only the first letter in capitals, e.g. `Ops.WebAudio.MidiLearn`

#### Port Names

Use capitals with spaces for the user-visible names in the op-settings, e.g. `Inner Radius`. You can use all capital letters for port names like `BPM` or `MIDI`.
Feel free to use whatever you prefer in code, most common is lowerCamelCase, e.g. `innerRadius`.  
If your op has one main-port which is needed to trigger it, call it `Execute`, if your op has an output-port to trigger other ops call it `Trigger`


```javascript
var innerRadius = op.addInPort("Inner Radius");
```



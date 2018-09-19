# Developing Ops

## Basic Setup

## Adding Ports and Port types

Different port examples below.

Value ports can hold a single value, a number (e.g. -1, 2.45), a bool (true, false), a string ("foo bar"), a string with multiple lines or a certain value from a dropdown-input.
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


See [Ports](../dev_creating_ports/dev_creating_ports.html)


### Op Constructor

The code you write inside your op will be executed once the op is added to the patch-view.
All your initialisation-code should be in the root of your code, e.g.

```javascript
var inPort = op.inValue("My Input Port");
var outPort = op.outValue("My Output Port");

// put your initialisation code here
...
```

At this state the links between ops / the port-values are not set, yet, we will come to this later…

`op` is a pre-defined object which bundles all the functions you need to interact with the world of cables.


## Callbacks and Events

### port.onChange

For every input-port (except `inFunction` and `inFunctionButton`) you can implement the `onChange`-method which gets called every time the value on the port changes. This means that it is being called when:

- the user entered a new value in the GUI (input field / moved a slider / checkbox / …)
- Another op linked to this port
- A link was removed

When a link to a value or string-value port was removed the old value (from the form) will be set again. If the old value is the same as the value from the linked op `onChange` will **not** be called, so it is only called if the value actually changed.

If a connection to an object or array-port is removed the port will contain `null`.

### op.onLoaded

In some cases you may want to run some code once all links have been set and all ports are fully loaded. Usually you don’t need this.

```
op.onLoaded = function() {
	// all ports are loaded  
};
```

### op.onDelete

When an op is removed from the patch or when another patch is loaded this is the place to clean up after yourself. Mostly you don’t need this.

```javascript
op.onDelete = function() {
  // clean up here
};
```

### op.data

Sometimes you need to create variables inside your op and make them accessible globally. Every op has a `data`-object-property which can be used for this. Instead of writing:
```javascript
var myVar = 1;
```

you could then do:
```javascript
op.data.myVar = 1; // globally accessible if you have access to the op
```

In most cases you don’t need this, but there are some use cases where it is helpful.

## Logging

```javascript
op.log( 'hello world' );.   
```

Do **not** use `console.log()`!   
`op.log()` is not shown if the patch is embedded and the silent parameter is set, also you get a reference to the op which is producing the log-message in your browsers developer tools.

## GUI

### Updating value-port UI-elements

If you want to update an UI-element like a slider in op-settings (e.g. when manually setting a value port) you need to call `showOpParams`:

```javascript
myPort.set(12345);
if(CABLES.UI){
	gui.patch().showOpParams(op);
}
```
**Tip: `op` is a reference to the op itself and may not be available yet, if you get an error add the line `var op = this;` to the top of your op-definition.**

### UI Attributes

These attributes are visible in the op parameter panel and can be used for debugging purposes.

- `info`: Shows an information message in op parameter panel
- `warning`: Shows a warning message in op parameter panel
- `error`: Shows an error message in op parameter panel

```javascript
if(CABLES.UI) {
  op.uiAttr( { 'info': 'Something happened, not too serious but still...' } );
  op.uiAttr( { 'warning': 'Something happened, not too serious but still...' } );
  op.uiAttr( { 'error': 'Big problem here, this is serious!' } );
  gui.patch().showOpParams(op); // update GUI
}
```

To clear a UI attribute you just have to set it to `null` :

```javascript
if(CABLES.UI) {
  op.uiAttr( { 'error': null } );
  gui.patch().showOpParams(op); // update GUI
}
```

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

### Op Documentation

- TODO: link to op doc page, e.g. https://cables.gl/op/Ops.TriggerLimiter
- TODO: show screenshot ?

### Publishing Ops

If you made an op and think it would be useful for other users get in touch with the cables-staff (via Slack or the [cables forum](https://forum.cables.gl/)).

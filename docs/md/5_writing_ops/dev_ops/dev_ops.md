# Developing Ops

## Basic Setup

## Adding Ports and Port types

Different port examples below.

Floating point number ports in and out:
```javascript
const inFloat = op.inFloat("Float in");
const outNumber = op.outNumber("Number out");
```
Integer number ports in and out:
```javascript
const inInt = op.inInt("Int in");
const outNumber = op.outNumber("Number out");
```
String ports in and out:
```javascript
const inString = op.inString("String in");
const outString = op.outString("String out");
```

Boolean ports in and out:
```javascript
const inBoolean = op.inBool("Boolean in");
const outBoolean = op.outBoolNum("Boolean out");
```

Trigger ports in and out:
```javascript
const inTrigger = op.inTrigger("Trigger In");
const outTrigger = op.outTrigger("Trigger out");
```
Array ports in and out:
```javascript
const inArray = op.inArray("Array in");
const outArray = op.outArray("Array out");
```

Object ports in and out:
```javascript
const inObject = op.inObject("Object In");
const outObject = op.outObject("Object Out");
```


See [Ports](../dev_creating_ports/dev_creating_ports)


### Op Constructor

The code you write inside your op will be executed once the op is added to the patch-view.
All your initialisation-code should be in the root of your code, e.g.

```javascript
const inPort = op.inFloat("My Input Port");
const outPort = op.outNumber("My Output Port");

// put your initialisation code here
...
```

At this state the links between ops / the port-values are not set, yet, we will come to this later…

`op` is a pre-defined object which bundles all the functions you need to interact with the world of cables.


## Callbacks and Events

### port.onChange

For every input-port (except `inTrigger` and `inTriggerButton`) you can implement the `onChange`-method which gets called every time the value on the port changes. This means that it is being called when:

- the user entered a new value in the GUI (input field / moved a slider / checkbox / …)
- Another op linked to this port
- A link was removed

When a link to a value or string-value port was removed the old value (from the form) will be set again. If the old value is the same as the value from the linked op `onChange` will **not** be called, so it is only called if the value actually changed.

If a connection to an object or array-port is removed the port will contain `null`.

Follow this [link](../dev_callbacks/dev_callbacks) for more information on Callbacks


### Naming Conventions

#### Op Names

UpperCamelCase, e.g. `KeyPressLearn` (`Ops.Devices.Keyboard.KeyPressLearn`). If your op has an abbreviation in it with multiple big letters in a row (e.g. `MIDI`), write only the first letter in capitals, e.g. `Ops.WebAudio.MidiLearn`

#### Port Names

Use capitals with spaces for the user-visible names in the op-settings, e.g. `Inner Radius`. You can use all capital letters for port names like `BPM` or `MIDI`.
Feel free to use whatever you prefer in code, most common is lowerCamelCase, e.g. `innerRadius`.
If your op has one main-port which is needed to trigger it, call it `Execute`, if your op has an output-port to trigger other ops call it `Trigger`


```javascript
const innerRadius = op.inFloat("Inner Radius");
```

# Op Documentation

Every op should have an example on how to use it. Just link to the public patches / examples which use your new op. It is good practice to include a minimal example at first which demonstrates the basic usage without all the bells and whistles. In a second one you could show a more advanced use-case.

Click this [link](https://cables.gl/op/Ops.Gl.Matrix.OrbitControls) for an example of how you can write clear documentation for your new op. All the documentation text is available in the patch editor view so make sure to fill it all in.

When you create a new op it automatically creates a documentation page for you. Click your op and then click the **view documentation** link in the UI pane to browse to the new page.<br>
![Button](img/dev_ops_view_documentation_link.png)

Scroll down the page and then click **edit this document** to create all of your documentation for your new op.<br>
![Button](img/dev_ops_edit_this_document.png)

You can now fill in all the details and documentation for your new op !

### Publishing Ops

If you made an op and think it would be useful for other users get in touch with the cables-staff via [discord](https://discord.gg/cablesgl) or [github](https://github.com/cables-gl/cables/issues).


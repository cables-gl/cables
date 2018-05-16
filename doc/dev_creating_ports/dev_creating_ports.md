# Ports

## Port Types

There are different types of ports your op can use:  

- `OP_PORT_TYPE_FUNCTION` – (blue) function port
- `OP_PORT_TYPE_VALUE` – (orange) value port
- `OP_PORT_TYPE_ARRAY` – (purple) array port
- `OP_PORT_TYPE_OBJECT` – (green) object port

### Function Ports

**TODO: Implement onTrigger Callback**

```
OP_PORT_TYPE_FUNCTION
```

Function ports are being used to trigger another op. If you do a visual-patch the first op you need to add is the `MainLoop`-op, which has a `trigger`-port – a function port which updates all connected ports 60 times a second.
Function ports can also be used to trigger under certain conditions – the [Op: Mouse](#)-op e.g. triggers on the `click`-port once a user clicked in the preview pane.

```javascript
var exec = op.addInPort( new Port( op, "exec", OP_PORT_TYPE_FUNCTION ));
var next = op.addOutPort( new Port( op, "next", OP_PORT_TYPE_FUNCTION ));

exec.onTrigger( function(){
	// ...
	next.trigger(); // trigger connected ops
});
```

#### Parameters

##### Display: Button

![Button](img/button.png)  

By adding `{ "display": "button" }` to a port-definition a button-UI element will be added to the op settings pane to manually trigger the port.

```javascript
var tap = op.addInPort( new Port( op, "tap", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
```

### Value Ports

```javascript
OP_PORT_TYPE_VALUE
```

Value ports can hold a single value, a number (e.g. -1, 2.45), a bool (true, false), a string ("foo bar"), a string with multiple lines or a certain value from a dropdown-input.

```javascript
var inPort = op.addInPort( new Port( op, "in port", OP_PORT_TYPE_VALUE ) );
var outPort = op.addOutPort( new Port( op, "out port", OP_PORT_TYPE_VALUE ) );
```

- Use `outPort.set(x);` / `inPort.set(x);` to change the value of a port
- Use `inPort.get();` to get the current value of a port

To set the default value of a port to e.g. `5` use `inPort.set(5)`.

#### Parameters

##### Display: Value (Default)

**TODO: Implement default, right now, just remove display if you want the default UI-element `**  

```javascript
var inPort = op.addInPort( new Port( op, "in port", OP_PORT_TYPE_VALUE ) );

inPort.onValueChange( function() {
    op.log('in port changed to:' + inPort.get());
});
```

Text-input-field which can be used to enter numbers, booleans and strings.

##### Display: File

Used for images, audio files and so on.

```javascript
var inUrlPort = op.addInPort( new Port( op, "file", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: 'image'  } ));
```

The `filter` is a file filter for the assets-browser, in the example above only images will be shown. You can currently use `image` and `audio`.  
`type: 'string'` means the port accepts a `url` as input, so you can load assets from another server without uploading them. Please note that there can be problems loading files from external servers, you should make sure that you catch any errors and inform the user by calling `op.uiAttr( { 'error': 'Could not load file!' } );`. This will color the op red and shows an error message in the op-settings.

If you want to react on a change of the file port you need to use the `getFilePath` function, which makes sure the file-path is correctly resolved (this is important if users want to export their patches):

```javascript
inUrlPort.onChange = function() {
	var url = op.patch.getFilePath(inUrlPort.get());  
};
```

If your op uses a default file, you need to make sure you set the port after all ports have been initialized and there is not other value entered into the port:

```javascript
// called when all ports have been initialized
op.onLoaded = function() {
  	// if there is no file selected
    if(filePort.get().length === 0) {
      	// use default file
        filePort.set("/assets/library/audio/default-audio-file.mp3");
    }
};
```

Have a look at the code of the op `Ops.WebAudio.Lib.Tonejs.Effect.Convolver` for a full example.

##### Display: Range

Displays a slider in the range `[min..max]` along with a text input field. The value of the input field can be out of range, so if your op cannot handle these values you need to manually check and reset the port by calling `inPort.set(...)`.

```javascript
var inPort = op.addInPort( new Port( op, "inPort", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 1, 'max': 10 } ));
```

##### Display: Bool

![](img/checkbox.png)

```javascript
var inPort = op.addInPort( new Port( op, "inPort", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );

inPort.onValueChange( function() {
	if( inPort.get() === true ){
		op.log( 'Checkbox checked' );
	} else {
		op.log( 'Checkbox unchecked' );
	}
});
```

##### Display: String

```javascript
var inPort = op.addInPort( new Port( op, "inPort", OP_PORT_TYPE_VALUE, { display: 'string' } ) );

inPort.onValueChange( function() {
	op.log( "Port changed to: " + inPort.get() === "foo bar" );
});
```

##### Display: Editor

![Editor Edit View](img/editor2.png)
![Editor Button](img/editor.png)

```javascript
var text = op.addInPort( new Port( op, "text", OP_PORT_TYPE_VALUE, { display: 'editor' } ) );

text.onValueChange( function() {
    op.log('text changed to:' + text.get());
});
```

If you click the edit button, text can be edited in the editor. Used for all kinds of multiline-input.

It is also possible to define the syntax highlighting for the editor-tab:

```javascript
var styleSheetPort = op.addInPort(
    new Port(op, "Stylesheet", OP_PORT_TYPE_VALUE, {
        display: 'editor',
        editorSyntax: 'css'
    })
);
```

##### Display: Dropdown

For a fixed amount of values to choose from.

```javascript
var align = op.addInPort( new Port( op, "align", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: ['left', 'center', 'right'] } ) );
```

### Array Ports

```
OP_PORT_TYPE_ARRAY
```

A Javascript array, which can either contain simple values, arrays or objects.

E.g. `[1, 2, 3]`, `[[1, 2], [3, 4]]`, `[{"one": 2}, {"three": 4}]`

### Object Ports

```
OP_PORT_TYPE_OBJECT
```

An object can contain basically anything, e.g.:

```javascript
{
  "a": 123,
  "b": "foo",
  "c": true,
  "d": {
    "e": [1, 2, 3, 4]
  }
}
```

## Storing data in ports

Every port has a `data`-object-attribute, which can be used to store port-specific-data. This can be useful e.g. when you create ports in a for loop and need to store an index-reference or something similar.

```javascript
var myPort = op.inValue("My In Port");
myPort.data.someValue = 1;

```

Additionally you can create a **read-only** port, which is visible, but cannot be edited.

```javascript
op.patchId = op.addInPort(new Port(op, "Patch ID", OP_PORT_TYPE_VALUE, { display: 'readonly' }));
```

## Port linking

Once a port is linked with another port `myPort.onLinkChanged` is executed. When it is executed the port may not have a value yet, it just sais: «There is a new connection». Later on `myPort.onLinkChanged` is called and you can get the new value with `myPort.get()`.

```javascript
op.name="MyTestOp";

var myPort = op.inValue("My Port");

myPort.onLinkChanged = function() {
	op.log("A link to myPort has been added or removed");
	if(myPort.isLinked()) {
		op.log("myPort has been linked");
	} else {
		op.log("myPort has been unlinked ");
	}
};

myPort.onLinkChanged = function() {
	op.log("The value on myPort changed to: ", myPort.get());
}
```

If you need to access to other (linked) port you can also do so:

```javascript
myPort.onLinkChanged = function() {
	op.log("A link to myPort has been added or removed");
	if(myPort.isLinked()) {
		op.log("myPort has been linked");
		// get the other port, as there can be multiple connections, get the last added one
		var otherPort = myPort.links[links.length-1].getOtherPort(myPort);
		op.log("Port is linked to: ", otherPort.name);
	} else {
		op.log("myPort has been unlinked ");
	}
};
```

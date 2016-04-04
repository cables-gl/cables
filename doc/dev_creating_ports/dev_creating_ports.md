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

Function ports are being used to trigger another op. If you do a visual-patch the first op you need to add is the [op: Renderer](#)-op, which has a `trigger`-port – a function port which updates all connected ports 60 times a second.
Function ports can also be used to trigger under certain conditions – the [Op: Mouse](#)-op e.g. triggers on the `click`-port once a user clicked in the preview pane.

```javascript
var exec = this.addInPort( new Port( this, "exec", OP_PORT_TYPE_FUNCTION ));
var next = this.addOutPort( new Port( this, "next", OP_PORT_TYPE_FUNCTION ));

exec.onTrigger( function(){
	// ...
	next.trigger(); // trigger connected ops
});
```

#### Parameters

##### Display: Button

![Button](img/Button.png)  

By adding `{ "display": "button" }` to a port-definition a button-UI element will be added to the op settings pane to manually trigger the port.

```javascript
var tap = this.addInPort( new Port( this, "tap", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
```

### Value Ports

```javascript
OP_PORT_TYPE_VALUE
```

Value ports can hold a single value, a number (e.g. -1, 2.45), a bool (true, false), a string ("foo bar"), a string with multiple lines or a certain value from a dropdown-input. 

```javascript
var inPort = this.addInPort( new Port( this, "in port", OP_PORT_TYPE_VALUE ) );
var outPort = this.addOutPort( new Port( this, "out port", OP_PORT_TYPE_VALUE ) );
```

- Use `outPort.set(x);` / `inPort.set(x);` to change the value of a port
- Use `inPort.get();` to get the current value of a port

#### Parameters

##### Display: Value (Default)

**TODO: Implement default, right now, just remove display if you want the default UI-element `**  

```javascript
var inPort = this.addInPort( new Port( this, "in port", OP_PORT_TYPE_VALUE ) );

inPort.onValueChange( function() {
    this.log('in port changed to:' + inPort.get());
});
```

Text-input-field which can be used to enter numbers, booleans and strings.

##### Display: File

Used for images, audio files and so on.

```javascript
var filename = this.addInPort( new Port( this, "file", OP_PORT_TYPE_VALUE, { display: 'file', type: 'string', filter: 'image'  } ));
```

The `filter` is a file filter for the assets-browser, in the example above only images will be shown. You can currently use `image` and `audio`.  
`type: 'string'` means the port accepts a `url` as input, so you can load assets from another server without uploading them. Please note that there can be problems loading files from external servers, you should make sure that you catch any errors and inform the user by calling `this.uiAttr( { 'error': 'Could not load file!' } );`. This will color the op red and shows an error message in the op-settings.

##### Display: Range

Displays a slider in the range `[min..max]` along with a text input field. The value of the input field can be out of range, so if your op cannot handle these values you need to manually check and reset the port by calling `inPort.set(...)`.

```javascript
var inPort = this.addInPort( new Port( this, "inPort", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 1, 'max': 10 } ));
```

##### Display: Bool

![](img/Checkbox.png)

```javascript
var inPort = this.addInPort( new Port( this, "inPort", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );

inPort.onValueChange( function() {
	if( inPort.get() === true ){
		this.log( 'Checkbox checked' );	
	} else {
		this.log( 'Checkbox unchecked' );	
	}
});
```

##### Display: Editor

![Editor Edit View](img/Editor2.png)
![Editor Button](img/Editor.png)

```javascript
var text = this.addInPort( new Port( this, "text", OP_PORT_TYPE_VALUE, { display: 'editor' } ) );

text.onValueChange( function() {
    this.log('text changed to:' + text.get());
});
```

If you click the edit button, text can be edited in the editor. Used for all kinds of multiline-input.

##### Display: Dropdown

For a fixed amount of values to choose from.

```javascript
var align = this.addInPort( new Port( this, "align", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: ['left', 'center', 'right'] } ) );
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

# Developing Ops

## Basic Setup

```javascript
op.name = 'MyVerySpecialOp';
```
`op` is a pre-defined object which bundles all the functions you need to interfere with the cables world.

## Adding Ports

See [Creating Ports](../dev_Creating_Ports/Creating_Ports.md)

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
- `error`: Shows an error message in op parameter panel and colors the op red

```javascript
op.uiAttr( { 'info': 'Something happened, not too serious but still...' } );
op.uiAttr( { 'warning': 'Something happened, not too serious but still...' } );
op.uiAttr( { 'error': 'Big problem here, this is serious!' } );
```

### Naming Conventions

#### Op Names

UpperCamelCase, e.g. `KeyPressLearn` (`Ops.Devices.Keyboard.KeyPressLearn`). If your op has an abbreviation in it with multiple big letters in a row (e.g. `MIDI`), write only the first letter in capitals, e.g. `Ops.WebAudio.MidiLearn`.

#### Port Names

Use capitals with spaces for the user-visible names in the op-settings, e.g. `Inner Radius`. You can use all capital letters for port names like `BPM` or `MIDI`. 
Feel free to use whatever you prefer in code, most common is lowerCamelCase, e.g. `innerRadius`.  
If your op has one main-port which is needed to trigger it, call it `Execute`, if your op has an output-port to trigger other ops call it `Trigger`.


```javascript
var innerRadius = op.addInPort( new Port( this, "Inner Radius", OP_PORT_TYPE_VALUE ));
```

### Op Documentation

The op documentation should be written in [markdown](https://daringfireball.net/projects/markdown/) language.
Use the following structure:

```markdown
# MyOp

*Ops.Users.Username.[OPTIONAL_NAMESPACE].MyOp*  

Some general infos about the op – what is it for? What would you use it for? You should make clear in a few sentences what matters.

## Input

### In Port 1

*Type: Function*  
This is the description of an input port named `In Port 1`, just tell a bit what it is for, maybe some links to external references.
If the port only works in a specific range, e.g. `[0, 10]` let other users now.

### In Port 2

...

## Output

### Out Port 1

*Type: Value*  
This is the description of an output port named `Out Port 1`.

### Out Port 2

...

## Examples

- [Some Example](https://cables.gl/ui/#/project/570287b85cac100233a4f85f)
- [Another Example](https://cables.gl/ui/#/project/570287b85cac100233a4f85f)
```

The optional namespace in the op-name can be used to bundle ops together, e.g. for a library – `Ops.Users.Username.MyLib.MyOp`.  `Username` should be written exactly as your registered *cables*-username, so e.g. `johanna`. No need to capitalize it.
Don’t forget to name the port type, e.g. `In Port 2 [Value]` or `In Port 2 [Function]`. Also It is important that the headlines for the port descriptions match the ones in your code 100%, so we can extract this information and present e.g. when hovering over a port.  
Also please note that behind the value definition (e.g. `*Type: Value*`) two spaces are needed to create a newline (this is default markdown behavior).
If you want to reference another op in your documentation use links like this: `[Name](../Full.Op.Name/Full.Op.Name.md)`, e.g. `[WireframeMaterial](../Ops.Gl.Shader.WireframeMaterial/Ops.Gl.Shader.WireframeMaterial.md)`.

```javascript
var innerRadius = op.addInPort( new Port( this, "Inner Radius", OP_PORT_TYPE_VALUE ));
```

```markdown
### Inner Radius [Value]
```

Every op should have an example on how to use it. Just link to public patches / examples which use your new op. It is a good practice to include a minimal example at first which demonstrates the basic usage without all the bells and whistles. In a second one you could show a more advanced use-case.

### Pull Requests / Public Ops

If you think one of your ops should be part of the *cables*-core, feel free to make a pull request via Github. Your op should be tested and working of course. Put your newly created op into a folder with the op-name, e.g. `Ops.Namespace.MyOp` and put it into the `src/ops/base`-folder. Every op must have a description (see above). The folder structure should look like this:

```
src/ops/base/
    ...
    Ops.Namespace.MyOp/
        Ops.Namespace.MyOp.js
        Ops.Namespace.MyOp.md
        img/
            anImage.jpg
            anotherImage.jpg
```

The image folder is optional, only use it if you want to add images to your op-description.

We don’t want to bloat the cables-core, so most ops are better off in the public ops directory (you can make an op public from within *cables*.

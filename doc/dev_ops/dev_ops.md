# Developing Ops

## Basic Setup

```
this.name = 'my very special op';
```

## Adding Ports

See [Creating Ports](../dev_Creating_Ports/Creating_Ports.md)

## Logging

```
this.log( 'hello world' );.   
```

Do **not** use `console.log()`!   
`this.log()` is not shown if the patch is embedded and the silent parameter is set, also you get a reference to the op which is producing the log-message.

## Callbacks

### Init

There is no explicit callback for initialization, all code in your op is automatically executed.

### onDelete

Once the op has been deleted, `onDelete` is called. Here you can clean up after yourself if you need to.

```
this.onDelete(function(){
	// clean up...
});
```

## GUI

### Updating value-port UI-elements 

If you want to update an UI-element (e.g. when manually setting a value port) you need to call `showOpParams`:

```
myPort.set(12345);
if(CABLES.UI){
	gui.patch().showOpParams(op);
}
```
**Tip: `op` is a reference to the op itself and may change in the future, if you get an error add the line `var op = this;` to the top of your op-definition.**

### UI Attributes

These attributes are visible in the op parameter panel and can be used for debugging purposes.

- `info`: Shows an information message in op parameter panel
- `warning`: Shows a warning message in op parameter panel
- `error`: Shows an error message in op parameter panel and colors the op red

```
this.uiAttr( { 'info': 'Something happened, not too serious but still...' } );
this.uiAttr( { 'warning': 'Something happened, not too serious but still...' } );
this.uiAttr( { 'error': 'Big problem here, this is serious!' } );
```
### Op Documentation

The op documentation should be written in [markdown](https://daringfireball.net/projects/markdown/) language.
Use the following structure:

```
# MyOb

*Ops.users.yourname.[OPTIONAL_NAMESPACE].MyOp*  

Some general infos about the op – what is it for? What would you use it for? Maybe also post a link to an example project here. You should make clear in a few sentences what matters.

## Ports

### Input

## in port 1 [Function]

This is the description of an input port named `in port 1`, just tell a bit what it is for, maybe some links to external references.
If the port only works in a specific range, e.g. `[0, 10]` let other users now.

## in port 2 [Value]

...

### Output

### in port 2 [Value]

This is the description of an output port named `out port 1`.
```

The optional namespace in the op-name can be used to bundle ops together, e.g. for a library – `Ops.users.yourname.MyLib.MyOp`.  
Don’t forget to name the port type, e.g. `in port 2 [Value]` or `in port 2 [Function]`

### Pull Requests / Public Ops

If you think one of your ops should be part of the *cables*-core, feel free to make a pull request via Github. Your op should be tested and working of course. Put your newly created op into a folder with the op-name, e.g. `Ops.users.yourname.MyLib.MyOp` and put it into the `src/ops/base`-folder. Every op must have a description (see above). The folder structure should look like this:

```
src/ ops/base/
    ...
    Ops.MyLib.MyOp/
        Ops.users.yourname.MyLib.MyOp.js
        Ops.users.yourname.MyLib.MyOp.md
```
We don’t want to bloat the cables-core, so some ops are better off in the public ops directory (you can make an op public from within *cables*.

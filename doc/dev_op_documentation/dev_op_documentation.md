# Op Documentation



The op documentation should be written in [markdown](https://daringfireball.net/projects/markdown/) language.
Use the following structure:

```markdown
# MyOp

*Ops.Users.Username.[OPTIONAL_NAMESPACE].MyOp* 

Some general info about the op – what is it for? What would you use it for? You should make it clear in a few sentences.

## Input

### In Port 1

*Type: Function*  
This is the description of an input port named `In Port 1`, give a short description or maybe some links to external references.
If the port only works in a specific range, e.g. `[0, 10]` let other users know.

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

Don’t forget to name the port type, e.g. `In Port 2 [Value]` or `In Port 2 [Function]`. Also It is important that the headlines for the port descriptions match the ones in your code 100%, so we can extract this information and present it  e.g. when hovering over a port.  

Also please note that behind the value definition (e.g. `*Type: Value*`) two spaces are needed to create a newline (this is default markdown behavior).
If you want to reference another op in your documentation use links like this: `[Name](../Full.Op.Name/Full.Op.Name.md)`, e.g. `[WireframeMaterial](../Ops.Gl.Shader.WireframeMaterial/Ops.Gl.Shader.WireframeMaterial.md)`.

​```javascript
var innerRadius = op.addInPort( new Port( this, "Inner Radius", OP_PORT_TYPE_VALUE ));
```

​```markdown
### Inner Radius [Value]
```

Every op should have an example on how to use it. Just link to the public patches / examples which use your new op. It is good practice to include a minimal example at first which demonstrates the basic usage without all the bells and whistles. In a second one you could show a more advanced use-case.



### Publishing Ops

If you made an op and think it would be useful for other users get in touch with the cables-staff (via Slack or the [cables forum](https://forum.cables.gl/)).
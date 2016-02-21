

# developing ops

## basic setup

```
Op.apply(this, arguments);
this.name='my very special op';
```

## adding ports

use ```addOutPort``` and ```addInPort``` to add new Ports to your op


- example:

```
var onoff=this.addOutPort(new Port(this,"on or off",OP_PORT_TYPE_VALUE,{display:'bool'}));
```

### port types

- ```OP_PORT_TYPE_FUNCTION``` (blue) function port
- ```OP_PORT_TYPE_VALUE``` (orange) value port
- ```OP_PORT_TYPE_ARRAY``` (purple) array port
- ```OP_PORT_TYPE_TEXTURE``` (green) texture port
- ```OP_PORT_TYPE_OBJECT``` (green) object port

### display parameter

- ```display``` how to display in ui, possible params: ```bool``` , ```editor```

### logging

- use ```this.log('hello world');```. do NOT use console.log. ever. this.log is not shown if the patch is embeded and the silent parameter is set.


### value ports

- use ```port.set(x);``` to change the value of a port
- use ```port.get();``` to get the current value of a port

### value port events

```
var name=this.addInPort(new Port(this,"your name",OP_PORT_TYPE_VALUE));

name.onValueChange(function()
{
    this.log('name was changed to:' + name.get());
});
```


### function ports executing and calling

when function ports will be executed ```onTriggered``` will be called.

you can trigger an output function port by calling ```trigger()```

```
var exec=this.addInPort(new Port(this,"exec",OP_PORT_TYPE_FUNCTION));
var next=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));

exec.onTriggered=function()
{
    // ...
    next.trigger();
}
```


----


## ui attributes

these attributes are only shown when you are in the cables ui.

you should always check if the user is in the ui or it is running embedded on a website


- ```warning``` shows a warning in op parameter panel
- ```info``` show information in op parameter panel


- example:

```
if(CABLES.UI)
{
    this.uiAttr({warning:'this is a warning...'});
}
```

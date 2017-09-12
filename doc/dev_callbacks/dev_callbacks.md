# Callbacks

In order to get informed on port-value-changes, function-triggers (also see [Ports](../dev_creating_ports/dev_creating_ports.md)) or general op-events there are a number of callbacks your op can implement.

*Tip: It’s always a good idea to inspect the code of existing ops by selecting an op and then pressing `view code` in the op-settings on the right.*  

## Port Callbacks

### onInit

There is no explicit callback for initialization, all code in your op is automatically executed.

### onChange

Can be implemented for `OP_PORT_TYPE_VALUE`, `OP_PORT_TYPE_ARRAY`, `OP_PORT_TYPE_OBJECT`.  

Every time a connected op calls the `myOutPort.set(...)` method, the in-port-callback `onChange` is called.

```javascript
myPort.onChange = function() {
  op.log('value of myPort changed to: ', myPort.get());
};
```

### onTrigger

Can be implemented for `OP_PORT_TYPE_FUNCTION`.  

Every time a connected op calls `myOutPort.trigger()` the connected in-ports’ `onTrigger` callback is called.

If your op needs to update its values continuously it should have an input port of type `OP_PORT_TYPE_FUNCTION`, which you can then connect to the [MainLoop](../ops/Ops.Gl.MainLoop/Ops.Gl.MainLoop.md)-op e.g..

```javascript
var exe = op.addInPort( new Port( this, "exe", OP_PORT_TYPE_FUNCTION ) );

exe.onTrigger = function() {
	// do something
};
```


### onLinkChange

Gets called whenever a port is connected / disconnected. It may not have a value yet.

```javascript
myPort.onLinkChanged = function() {
	if( myPort.isLinked() ) {
		// port connected  
	} else {
		// port disconnected
	}
};
```

## General Op Callbacks

### onDelete

If your op needs to clean up after itself when it is deleted from the patch you can implement `onDelete`:

```javascript
op.onDelete( function() {
	// do some manual cleanup here
});
```

### onLoaded

Gets called when the whole patch is loaded / all ops are linked / all external libraries loaded etc. You mostly don’t need this, as op-specific init-code can just be put in your op-code without a callback. `op.onLoaded` is not called when the patch has just been added to the patch, only when the patch is loaded.

```javascript
op.onLoaded = function() {
	// do something
};
```

### onResize

Whenever the canvas is resized `onResize`gets called.

```javascript
op.onResize( function() {
	// adapt to the new size
});
```

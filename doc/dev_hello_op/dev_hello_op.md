# Hello Op

Let’s write our first op, which has a value input and output.

Create a new op by clicking `Op` -> `Create` (in the navigation bar at the top left part of the screen).
Or you can press escape to browse to the ops menu then enter your own unique op name in the search bar, then click the button with `Create Ops.User.YourUserName.YourOpsName` to create your own op.  

A naming example below:
```javascript
`HelloOp` is the short-name of your op and `Ops.user.yourname.HelloOp` the unique name. 
```
Now add the following code:    

```javascript
var myInPort = op.inValue("Input");
```

We have now defined a new port called `myInPort` with the visible text label `My In Port`, which can be used to enter a value in op-settings or act as input from another op. In this example we will just forward the input value to an out-port. So let’s define it below:

```javascript
var myOutPort = op.outValue("Output");
```

In the top of the editor window click on `Save` and afterwards `Execute`, now reload the patch (the browser window) by pressing `cmd + r`. Now click on `Op` —> `Add` on the very top of the window, enter the name of the op you just created – `HelloOp` and press Enter.

You now see your newly created op with one input- and one output-port:

![](img/hello-op-1.png)

Let’s add some logic to the op – whenever the input-port `myInPort` changes (has a new value) we want to react on it and set the output port `myOutPort` accordingly. For now we just pass the input value through to the output port.

To get notified when the input-port has a new value we need the function `onChange` which gets called every time there is a new value on the `myInPort` port. Add the following lines below:

```javascript
myInPort.onChange = function() {
  	var inputValue = myInPort.get(); // get the new value from the input port
    myOutPort.set(inputValue); // set the output value
};
```

`Save` / `Execute` the editor and try it out: Select your op and enter another input value – you will see that the output value will also update. Nice!

![](img/hello-op-inout-same.png)

Your op-code should look like this now:  

```javascript
op.name="HelloOp";

var myInPort = op.inValue("Input");
var myOutPort = op.outValue("Output");

myInPort.onChange = function() {
  	var inputValue = myInPort.get(); 
    myOutPort.set(inputValue);
};
```

Now let’s add some logic, every time the input value changes we want the output value to be two times the input value, all we have to do is to add a `2*`.

Change this:  

```javascript
myOutPort.set(inputValue);
```

to:  

```javascript
myOutPort.set(2*inputValue);
```

![Op Settings (multiply by 2)](img/op-settings-mul.png)

That’s it for now – you created your first op which multiplies values by two!

For other port-types check out [Ports Documentation](../dev_creating_ports/dev_creating_ports.md).



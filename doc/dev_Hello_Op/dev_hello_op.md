# Hello Op

Let’s write our first op, which has a value input and output.

Create a new patch by clicking on `Patch` —> `New`. Now we need to create a new operator – click on `Op` —> `New Op` and enter the name `HelloOp`.

The editor will show the following code:  

```javascript
this.name="Ops.user.yourname.HelloOp";
```

`HelloOp` is the short-name of your op and `Ops.user.yourname.HelloOp` the unique name. If you make an op public,it can be found under the long name.

Now add the following code:    

```javascript
var myInPort = this.addInPort( new Port( this, "My In Port", OP_PORT_TYPE_VALUE ) );
```

We have now defined a new port called `myInPort` with the visible text label `My In Port`, which can be used to enter a value in op-settings or act as input from another op. In this example we will just forward the input value to an out-port. So let’s define it:

```javascript
var myOutPort = this.addOutPort( new Port( this, "My Out Port", OP_PORT_TYPE_VALUE ) );
```

If we now want to forward the value from our port `myInPort` to `myOutPort` we need to implement the function `onValueChange` which gets called every time there is a new value on the `myInPort` port. Add the following lines:

```javascript
myInPort.onValueChange( function() {
    this.log('My In Port changed to:' + myInPort.get());
    myOutPort.set( myInPort.get() );
});
```

Once the value of `myInPort` changed, all code in the function `myInPort.onValueChange` will be executed. The first line is `this.log('My In Port changed to:' + myInPort.get());` which just prints the value of `myInPort` to the browser’s developer console. Check out the [Developer Console Tutorial](developer_console_tutorial.md) for some tips on how to use it.
The next line writes the value to our output port. `myInPort.get()` returns the value of our in port and `myOutPort.set(...)` sets the value of our out port. 
 
Your op-code should look like this now:  

```javascript
this.name="Ops.user.yourname.HelloOp";

var myInPort = this.addInPort( new Port( this, "My In Port", OP_PORT_TYPE_VALUE ) );
var myOutPort = this.addOutPort( new Port( this, "My Out Port", OP_PORT_TYPE_VALUE ) );

myInPort.onValueChange( function() {
    this.log('My In Port changed to:' + myInPort.get());
    myOutPort.set( myInPort.get() );
});
```

Now click on the op to access the input element for `myInPort`.

![Op SVG](img/Hello-Op.png)

![Op Settings](img/Op-Settings.png)

If you change the `In Value` you will see the `Out Value` change as well. Now let’s add some logic, every time the input value changes we want the output value to be two times the input value, all we have to do is to add a `2*`.

Change this:  

```javascript
myOutPort.set( myInPort.get() );
```

to:  

```javascript
myOutPort.set( 2 * myInPort.get() );
```

![Op Settings (multiply by 2)](img/Op-Settings-Mul.png)

The ports we used here are both *value ports*, which means they can act as input and output port for a number. For the other kinds of ports check out [Ports Documentation](Ports.md).



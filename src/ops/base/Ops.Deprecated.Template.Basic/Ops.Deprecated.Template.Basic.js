// Op name – will be visible in the patch editor
op.name="My New Op";

// Input ports
var execute = op.addInPort( new CABLES.Port( this, "Execute",CABLES.OP_PORT_TYPE_FUNCTION) );
var number1 = op.addInPort( new CABLES.Port(op, "Number 1", CABLES.OP_PORT_TYPE_) );
var number2 = op.addInPort( new CABLES.Port(op, "Number 2", CABLES.OP_PORT_TYPE_) );
// Output ports
var next = op.addOutPort( new CABLES.Port( this, "Next",CABLES.OP_PORT_TYPE_FUNCTION) );
var result = op.addOutPort( new CABLES.Port(op, "Result", CABLES.OP_PORT_TYPE_) );

// Define callback functions when the value of the input ports changed
number1.onChange=update;
number2.onChange=update;

// Define callback when op is executed
execute.onTriggered = update;

// Set the default values
number1.set(2);
number2.set(3);

// Initial update
update();

// Main function, gets called every time the op is triggered
// or one of the in-ports changed
function update() {
    // Read values of the inports and do something with them
    var a = number1.get() * number2.get(); // do something here
    // Write result to output port
    result.set(a);
    // Trigger the next op, which is connected to this one
    next.trigger();
}

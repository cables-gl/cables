op.name='Sinus';
var value=op.addInPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new CABLES.Port(op,"result"));

var phase=op.addInPort(new CABLES.Port(op,"phase",CABLES.OP_PORT_TYPE_VALUE));
var mul=op.addInPort(new CABLES.Port(op,"frequency",CABLES.OP_PORT_TYPE_VALUE));
var amplitude=op.addInPort(new CABLES.Port(op,"amplitude",CABLES.OP_PORT_TYPE_VALUE));

mul.set(1.0);
amplitude.set(1.0);
phase.set(1);

value.onChange=function()
{
    result.set(
        amplitude.get() * 
        Math.sin( 
            (value.get()) 
            + phase.get() ));
};


const value=op.addInPort(new Port(op,"value",OP_PORT_TYPE_VALUE));
const result=op.addOutPort(new Port(op,"result"));

const phase=op.addInPort(new Port(op,"phase",OP_PORT_TYPE_VALUE));
const mul=op.addInPort(new Port(op,"frequency",OP_PORT_TYPE_VALUE));
const amplitude=op.addInPort(new Port(op,"amplitude",OP_PORT_TYPE_VALUE));


mul.set(1.0);
amplitude.set(1.0);
phase.set(1);

value.onValueChanged=function()
{
    result.set(
        amplitude.get() * 
        Math.sin( 
            (value.get()*mul.get()) 
            + phase.get() ));
};


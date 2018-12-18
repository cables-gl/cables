var v=op.addInPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));
const result=op.outValue("result");

var exec=function()
{
    result.set(parseFloat(v.get()));
};

v.onChange=exec;

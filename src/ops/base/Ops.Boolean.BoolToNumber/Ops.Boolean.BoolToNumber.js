op.name="BoolToNumber";

var bool=op.addInPort(new Port(op,"bool",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var number=op.addOutPort(new Port(op,"number",CABLES.OP_PORT_TYPE_VALUE));

bool.onValueChanged=function()
{
    if(bool.get()) number.set(1);
        else number.set(0);
    
};
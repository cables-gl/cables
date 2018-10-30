op.name="BoolToNumber";

var bool=op.addInPort(new CABLES.Port(op,"bool",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var number=op.addOutPort(new CABLES.Port(op,"number",CABLES.OP_PORT_TYPE_VALUE));

bool.onChange=function()
{
    if(bool.get()) number.set(1);
        else number.set(0);
    
};
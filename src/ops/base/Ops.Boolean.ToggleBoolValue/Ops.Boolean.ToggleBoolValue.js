var bool=op.addInPort(new CABLES.Port(op,"in bool",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var outbool=op.addOutPort(new CABLES.Port(op,"out bool",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

bool.changeAlways=true;

bool.onChange=function()
{
    outbool.set( ! (true==bool.get()) );
};
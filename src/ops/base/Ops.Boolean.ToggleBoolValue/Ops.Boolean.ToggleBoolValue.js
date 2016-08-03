op.name="ToggleBoolValue";

var bool=op.addInPort(new Port(op,"in bool",OP_PORT_TYPE_VALUE,{display:'bool'}));
var outbool=op.addOutPort(new Port(op,"out bool",OP_PORT_TYPE_VALUE,{display:'bool'}));

bool.onValueChanged=function()
{
  outbool.set(!bool.get());
};
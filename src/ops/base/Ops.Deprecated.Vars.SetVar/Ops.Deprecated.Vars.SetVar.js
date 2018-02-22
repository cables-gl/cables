op.name='SetVar';

var varname=op.addInPort(new Port(op,"name",OP_PORT_TYPE_VALUE,{type:'string'}));
var v=op.addInPort(new Port(op,"val",OP_PORT_TYPE_VALUE,{}));

function exec()
{
    op.patch.vars[varname.get()]=v.get();
}

varname.onValueChanged=exec;
v.onValueChanged=exec;

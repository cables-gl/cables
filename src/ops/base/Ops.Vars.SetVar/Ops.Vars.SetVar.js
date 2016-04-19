op.name='SetVar';

var v=op.addInPort(new Port(op,"val",OP_PORT_TYPE_VALUE,{}));
var varname=op.addInPort(new Port(op,"name",OP_PORT_TYPE_VALUE,{type:'string'}));

function exec()
{
    op.patch.vars[varname.get()]=v.get();
}

varname.onValueChanged=exec;
v.onValueChanged=exec;

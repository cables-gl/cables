op.name='SetVar';

var varname=op.addInPort(new CABLES.Port(op,"name",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var v=op.addInPort(new CABLES.Port(op,"val",CABLES.OP_PORT_TYPE_VALUE,{}));

function exec()
{
    op.patch.vars[varname.get()]=v.get();
}

varname.onChange=exec;
v.onChange=exec;

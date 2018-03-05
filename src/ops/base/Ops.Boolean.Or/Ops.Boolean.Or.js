
var bool0=op.addInPort(new Port(op,"bool 1",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool1=op.addInPort(new Port(op,"bool 2",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool2=op.addInPort(new Port(op,"bool 3",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool3=op.addInPort(new Port(op,"bool 4",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool4=op.addInPort(new Port(op,"bool 5",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool5=op.addInPort(new Port(op,"bool 6",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool6=op.addInPort(new Port(op,"bool 7",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool7=op.addInPort(new Port(op,"bool 8",OP_PORT_TYPE_VALUE,{display:'bool'}));

var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_VALUE));

function exec()
{
    result.set( bool0.get() || bool1.get()  || bool2.get() || bool3.get() || bool4.get() || bool5.get() || bool6.get() || bool7.get() );
}

bool0.onValueChange(exec);
bool1.onValueChange(exec);
bool2.onValueChange(exec);
bool3.onValueChange(exec);
bool4.onValueChange(exec);
bool5.onValueChange(exec);
bool6.onValueChange(exec);
bool7.onValueChange(exec);


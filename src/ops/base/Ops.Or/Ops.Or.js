Op.apply(this, arguments);

this.name='Or';

var bool0=this.addInPort(new Port(this,"bool 1",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool1=this.addInPort(new Port(this,"bool 2",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool2=this.addInPort(new Port(this,"bool 3",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool3=this.addInPort(new Port(this,"bool 4",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool4=this.addInPort(new Port(this,"bool 5",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool5=this.addInPort(new Port(this,"bool 6",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool6=this.addInPort(new Port(this,"bool 7",OP_PORT_TYPE_VALUE,{display:'bool'}));
var bool7=this.addInPort(new Port(this,"bool 8",OP_PORT_TYPE_VALUE,{display:'bool'}));

var result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_VALUE));

function exec()
{
    result.set( bool0.get() || bool1.get()  || bool2.get() || bool3.get() || bool4.get() || bool5.get() || bool6.get() || bool7.get() );
    // console.log('or result: ',result.get() );
}

bool0.onValueChange(exec);
bool1.onValueChange(exec);
bool2.onValueChange(exec);
bool3.onValueChange(exec);
bool4.onValueChange(exec);
bool5.onValueChange(exec);
bool6.onValueChange(exec);
bool7.onValueChange(exec);


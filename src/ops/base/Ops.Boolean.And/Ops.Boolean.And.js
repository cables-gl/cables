op.name='And';

var bool0=op.addInPort(new CABLES.Port(op,"bool 1",CABLES.OP_PORT_TYPE_VALUE));
var bool1=op.addInPort(new CABLES.Port(op,"bool 2",CABLES.OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new CABLES.Port(op,"result",CABLES.OP_PORT_TYPE_VALUE));

function exec()
{
    result.set( bool1.get() && bool0.get() );
}

bool0.onValueChanged=exec;
bool1.onValueChanged=exec;


op.name="AreaMesh";

var execute=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));

var points=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));

execute.onTriggered=function()
{
    console.log('123');
    
    
};

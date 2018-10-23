
// remove trigger - see valuetrigger...


op.name='Value';
var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var v=op.addInPort(new Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new Port(op,"result"));

// function frame(time)
// {
//     op.exec();
// }

var exec=function()
{
    // var va=v.get();
    // if(result.get()!=va) 
    result.set(v.get());
};

exe.onTriggered=exec;
v.onValueChanged=exec;

// remove trigger - see valuetrigger...

op.name = "Value";
let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.Port.TYPE_FUNCTION));
let v = op.addInPort(new CABLES.Port(op, "value", CABLES.Port.TYPE_VALUE));

let result = op.addOutPort(new CABLES.Port(op, "result"));

// function frame(time)
// {
//     op.exec();
// }

let exec = function ()
{
    // var va=v.get();
    // if(result.get()!=va)
    result.set(v.get());
};

exe.onTriggered = exec;
v.onChange = exec;

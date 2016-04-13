op.name='Repeat 2d';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var numx=op.addInPort(new Port(op,"num x"));
var numy=op.addInPort(new Port(op,"num y"));
var mul=op.addInPort(new Port(op,"mul"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var idxx=op.addOutPort(new Port(op,"x"));
var idxy=op.addOutPort(new Port(op,"y"));
var idx=op.addOutPort(new Port(op,"index"));


mul.set(1);
numx.set(5);
numy.set(5);

exe.onTriggered=function()
{
    var m=mul.get();
    for(var y=numy.get()-1;y>-1;y--)
    {
        idxy.set(y*m);
        for(var x=numx.get()-1;x>-1;x--)
        {
            idxx.set(x*m);
            idx.set(x+y*numx.get());
            trigger.trigger();
        }
    }
};

op.name='sequence';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var exes=[];
var triggers=[];

var triggerAll=function()
{
    for(var i=0;i<triggers.length;i++) triggers[i].trigger();
};

exe.onTriggered=triggerAll;

var num=16;

for(var i=0;i<num;i++)
{
    triggers.push( op.addOutPort(new Port(op,"trigger "+i,OP_PORT_TYPE_FUNCTION)) );
    
    if(i<num-1)
    {
        var newExe=op.addInPort(new Port(op,"exe "+i,OP_PORT_TYPE_FUNCTION));
        newExe.onTriggered=triggerAll;
        exes.push( newExe );
    }
}

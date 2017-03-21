op.name='ArrayIterator 3x';
var exe=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new Port(op,"Array",OP_PORT_TYPE_ARRAY));

var pStep=op.inValue("Step");

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new Port(op,"Index"));

var valX=op.addOutPort(new Port(op,"Value 1"));
var valY=op.addOutPort(new Port(op,"Value 2"));
var valZ=op.addOutPort(new Port(op,"Value 3"));

var ar=arr.get()||[];


arr.onChange=function()
{
    ar=arr.get()||[];  
};

var vstep=1;
pStep.onChange=changeStep;

function changeStep()
{
    vstep=pStep.get()||1;
    if(vstep<1.0)vstep=1.0;
    vstep=3*vstep;
}
changeStep();

var i=0;
var count=0;
exe.onTriggered=function()
{
    count=0;
    
    for (var i = 0, len = ar.length; i < len; i+=vstep)
    {
        idx.set(count);
        valX.set( ar[i+0] );
        valY.set( ar[i+1] );
        valZ.set( ar[i+2] );
        trigger.trigger();
        count++;
    }

};

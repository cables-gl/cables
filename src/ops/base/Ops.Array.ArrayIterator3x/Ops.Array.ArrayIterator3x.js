var exe=op.addInPort(new CABLES.Port(op,"Execute",CABLES.OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new CABLES.Port(op,"Array",CABLES.OP_PORT_TYPE_ARRAY));

var pStep=op.inValue("Step");

var trigger=op.outTrigger('Trigger');
var idx=op.addOutPort(new CABLES.Port(op,"Index"));

var valX=op.addOutPort(new CABLES.Port(op,"Value 1"));
var valY=op.addOutPort(new CABLES.Port(op,"Value 2"));
var valZ=op.addOutPort(new CABLES.Port(op,"Value 3"));

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

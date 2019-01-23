const
    exe=op.inTrigger("Execute"),
    arr=op.inArray("Array"),
    pStep=op.inValue("Step"),
    trigger=op.outTrigger('Trigger'),
    idx=op.outValue("Index"),
    valX=op.outValue("Value 1"),
    valY=op.outValue("Value 2"),
    valZ=op.outValue("Value 3");

var ar=arr.get()||[];

var vstep=1;
pStep.onChange=changeStep;
changeStep();

var i=0;
var count=0;

arr.onChange=function()
{
    ar=arr.get()||[];
};

function changeStep()
{
    vstep=pStep.get()||1;
    if(vstep<1.0)vstep=1.0;
    vstep=3*vstep;
}

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

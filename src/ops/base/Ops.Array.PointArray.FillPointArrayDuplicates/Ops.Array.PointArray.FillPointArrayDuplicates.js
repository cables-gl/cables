const
    inArr=op.inArray("Array"),
    inNumPoints=op.inValueInt("Num Elements",1000),
    inCalc=op.inTriggerButton("Calculate"),
    outArr=op.outArray("Result")
    ;

op.toWorkPortsNeedToBeLinked(inArr);

var arr=[];

inCalc.onTriggered=function()
{
    var num=inNumPoints.get();

    arr.length=num*3;

    var oldArr=inArr.get();
    if(!oldArr)
    {
        outArr.set(null);
        return;
    }
    var numOld=oldArr.length;

    var i=0;
    for(i=0;i<numOld;i++)
    {
        arr[i]=oldArr[i];
    }

    Math.randomSeed=5711;


    while(i<(num-1)*3)
    {
        var ind=Math.floor(Math.seededRandom()*(numOld/3))*3;

        arr[i+0]=oldArr[ind+0];
        arr[i+1]=oldArr[ind+1];
        arr[i+2]=oldArr[ind+2];
        i+=3;
    }

    outArr.set(null);
    outArr.set(arr);

};
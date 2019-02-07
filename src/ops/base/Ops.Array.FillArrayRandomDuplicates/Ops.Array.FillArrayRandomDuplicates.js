const
    inArr=op.inArray("Array"),
    inNum=op.inValueInt("Num Elements",1000),
    inCalc=op.inTriggerButton("Calculate"),
    outArr=op.outArray("Result")
    ;

op.toWorkPortsNeedToBeLinked(inArr);

var arr=[];

inCalc.onTriggered=function()
{
    var num=inNum.get();

    arr.length=num;

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


    while(i<(num-1))
    {
        var ind=Math.floor(Math.seededRandom()*numOld);

        arr[i+0]=oldArr[ind];
        i++;
    }

    outArr.set(null);
    outArr.set(arr);

};
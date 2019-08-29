var exe=op.inTrigger("Exe");

var inArr1=op.inArray('Array 1');
var inArr2=op.inArray('Array 2');

var inPerc=op.inValueSlider("perc");

var next=op.outTrigger("Next");
var outArr=op.outArray("Result");

var resultArr=[];


exe.onTriggered=function()
{
    var arr1=inArr1.get();
    var arr2=inArr2.get();

    var val1;
    var val2;
    var m;

    if(!arr1 || !arr2 || arr1.length<arr2.length)
    {
        outArr.set(null);
    }

    else
    {
        if(resultArr.length!=arr1.length) resultArr.length=arr1.length;

        var perc=inPerc.get();

        for(var i=0;i<arr1.length;i++)
        {
            val1=arr1[i];
            val2=arr2[i];
            m=(val2-val1)*perc+val1;
            resultArr[i]=m;
        }

        outArr.set(null);
        outArr.set(resultArr);
    }

    next.trigger();

};

//check that array input is string or not
inArr1.onLinkChanged = inArr2.onLinkChanged  = function ()
{
    var arr1=inArr1.get();
    var arr2=inArr2.get();

    if(!arr1 || !arr2)
    {
        outArr.set(null);
        return;
    }

    var stringTest1 = arr1[0];
    var stringTest2 = arr2[0];

    if(typeof stringTest1  === 'string' || typeof stringTest2  === 'string' )
    {
        outArr.set(null);
        return;
    }

};

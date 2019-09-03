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
            //old cude buggy
            m= (val2-val1)*perc+val1;
            //new code fixes
            //var m = val1 *(1 - perc) +val2 * perc;
            resultArr[i]=m;
        }

        outArr.set(null);
        outArr.set(resultArr);
    }

    next.trigger();

};

// still not working
// inArr1.onLinkChanged = inArr2.onLinkChanged  = function ()
// {
//     var arr1=inArr1.get();
//     var arr2=inArr2.get();

//     console.log("port linked");
//     console.log(arr1);
//     console.log(arr2);

    // if(!arr1.some(isNaN))
    // {
    //     console.log("Array wasn't numerical");
    //     return;
    // }

// };
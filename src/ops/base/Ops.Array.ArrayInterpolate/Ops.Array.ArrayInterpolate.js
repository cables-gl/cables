var exe=op.inFunction("Exe");

var inArr1=op.inArray('Array 1');
var inArr2=op.inArray('Array 2');

var inPerc=op.inValueSlider("perc");


var next=op.outFunction("Next");
var outArr=op.outArray("Result");


var resultArr=[];

exe.onTriggered=function()
{
    var arr1=inArr1.get();
    var arr2=inArr2.get();
    
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
            var val1=arr1[i];
            var val2=arr2[i];

            var m=( (val2-val1)*perc+val1 );
        
            resultArr[i]=m;
        }
        
        outArr.set(null);
        outArr.set(resultArr);
    }
    
    next.trigger();

};

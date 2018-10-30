var inArr1=op.inArray('Array 1');
var inArr2=op.inArray('Array 2');

var inPos=op.inValueSlider("Pos");
var inWidth=op.inValueSlider("Width");

var exe=op.inTrigger("Exe");

var easing=op.inValueSelect("Easing",[
    'Linear',
    'Expo in','Expo out','Expo in out',
    'Cubic in','Cubic out','Cubic in out'],
    'Linear');
    
var reverse=op.inValueBool("Reverse");

var next=op.outTrigger("Next");
var outArr=op.outArray("Result");
var resultArr=[];
var easingFunction=null;

easing.onChange=function()
{
    if(easing.get()=='Expo in') easingFunction=CABLES.easeExpoIn;
    else if(easing.get()=='Expo out') easingFunction=CABLES.easeExpoOut;
    else if(easing.get()=='Expo in out') easingFunction=CABLES.easeExpoInOut;
    else if(easing.get()=='Cubic in') easingFunction=CABLES.easeCubicIn;
    else if(easing.get()=='Cubic out') easingFunction=CABLES.easeCubicOut;
    else if(easing.get()=='Cubic in out') easingFunction=CABLES.easeCubicInOut;
    else easingFunction=null;
    console.log(easingFunction);
};

exe.onTriggered=function()
{
    var arr1=inArr1.get();
    var arr2=inArr2.get();

    if(!arr1 || !arr2 || arr2.length<arr1.length)
    {
        outArr.set(null);
    }
    else
    {
        if(resultArr.length!=arr1.length) resultArr.length=arr1.length;
        var distNum=inWidth.get()*(resultArr.length*4);
        var pos=inPos.get()*(arr1.length+distNum);

        for(var i=0;i<arr1.length;i++)
        {
            var val1=arr1[i];
            var val2=arr2[i];

            var ppos=pos-i;
            if(reverse.get())ppos=pos-(arr1.length-i);
            var dist=ppos/distNum;

            if(dist>1) resultArr[i]=val2;
            else if(dist<=0) resultArr[i]=val1;
            else
            {
                if(easingFunction) dist=easingFunction(dist);
                var m=( (val2-val1)*dist+val1 );
                resultArr[i]=m;
            }
        }
        
        outArr.set(null);
        outArr.set(resultArr);
    }
    
    next.trigger();
};



















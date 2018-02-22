var inTime=op.inValue("Time");
var animVal=op.inValue("Value");

var timeUnit=op.inValueSelect("Unit",['Seconds','Frames'],'Seconds');

var outVal=op.outValue("Result");
var outArr=op.outArray("Anim Array");

inTime.onChange=update;
var hasError=false;

animVal.setAnimated(true);
animVal.anim.onChange=animChange;
op.onLoaded=animChange;

var useFrames=false;

timeUnit.onChange=function()
{
    useFrames=(timeUnit.get()=='Frames');
};

function update()
{
    inTime.get();

    if(animVal.isAnimated())
    {
        var t=inTime.get();
        if(useFrames) t=(t/30.0);
        var v=animVal.anim.getValue(t);
        outVal.set(v);
        if(hasError)
        {
            op.error('noanim',null);
            hasError=false;

            animVal.anim.onChange=animChange;
        }
    }
    else
    {
        op.error('noanim','animVal should be animated');
        hasError=true;
    }
}

function animChange()
{
    var arr=[];
    if(animVal.anim.keys && animVal.anim.keys.length>0)
    {
        arr.length=animVal.anim.keys.length*2;
        // console.log('anim change!');
        for(var i=0;i<animVal.anim.keys.length;i++)
        {
            arr[i*2+0]=animVal.anim.keys[i].time;
            arr[i*2+1]=animVal.anim.keys[i].value;
            
        }
    }
    
    outArr.set(null);
    outArr.set(arr);
}

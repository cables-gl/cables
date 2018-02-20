
var inTime=op.inValue("Time");
var animVal=op.inValue("Value");
var outVal=op.outValue("Result");
inTime.onChange=update;
var hasError=false;

var outArr=op.outArray("Anim Array");

// animVal.hidePort();
animVal.setAnimated(true);
animVal.anim.onChange=animChange;

function update()
{
    inTime.get();

    if(animVal.isAnimated())
    {
        var v=animVal.anim.getValue(inTime.get());
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

op.onLoaded=animChange;

function animChange()
{
    var arr=[];
    if(animVal.anim.keys && animVal.anim.keys.length>0)
    {
        arr.length=animVal.anim.keys.length*2;
        console.log('anim change!');
        for(var i=0;i<animVal.anim.keys.length;i++)
        {
            arr[i*2+0]=animVal.anim.keys[i].time;
            arr[i*2+1]=animVal.anim.keys[i].value;
            
        }
    }
    
    outArr.set(null);
    outArr.set(arr);
}

var inVal=op.inValue("Delta");

var snapVals=op.inArray("Snap at Values");
var snapDist=op.inValue("Snap Distance");
var snapDistRelease=op.inValue("Snap Distance Release");
var inSlow=op.inValue("Slowdown",0.4);
var inBlock=op.inValue("Block Input after snap");
var inReset=op.inFunctionButton("Reset");
var inMin=op.inValue("Min",0);
var inMax=op.inValue("Max",0);

var inMul=op.inValue("Value Mul",1);

var outVal=op.outValue("Result");
var outDist=op.outValue("Distance");
var outSnapped=op.outValue("Snapped");
var outWasSnapped=op.outValue("was snapped");



inVal.onChange=update;
inVal.changeAlways=true;

var snapped=false;
var val=0;
var hasError=false;
var timeout=0;
var blocking=false;
var lastValue=-1;

snapVals.onChange=checkError;

inReset.onTriggered=function()
{
    val=0;
    outVal.set(val);
    // update();
};

function checkError()
{
    var snaps=snapVals.get();
    if(!snaps || snaps.length==0)
    {
        op.error("snapsnull","needs array containing snap points");
        hasError=true;
        return;
    }
    
    if(hasError)
    {
        op.error("snapsnull",null);
        hasError=false;
        setTimeout(update,500);
    }
}

function update()
{
    if(blocking)return;
    var snaps=snapVals.get();

    var d=999999999;
    var snapvalue=0;
    for(var i=0;i<snaps.length;i++)
    {
        var dd=Math.abs(val-snaps[i])+0.01;
        if(dd<d)
        {
            d=dd;
            snapvalue=snaps[i];
        }
    }

    if(d===0)return;
    if(inVal.get()===0)return;
    
    if(d<snapDistRelease.get())
    {
        var vv=inVal.get()*Math.abs(((d/snapDistRelease.get())*inSlow.get()))*inMul.get();
        val+=vv;

        clearTimeout(timeout);
        
        // console.log("Snap dist release!~");
        timeout=setTimeout(function()
            {
                val=snapvalue;
                outVal.set(val);
            },250);
    }
    else
    {
        clearTimeout(timeout);
        val+=inVal.get();
    }

    inVal.set(0);

    d=Math.abs(val-snapvalue);
    outDist.set(d);

    if(d>snapDist.get() )
    {
        snapped=false;
        wassnapped=false;
    }

    if(!snapped)
    {
        if(d<snapDist.get() )
        {
            val=snapvalue;
            if(inBlock.get()>0)
            {
                blocking=true;
                setTimeout(function()
                    {
                        blocking=false;
                        
                    },inBlock.get()*1000);
            }
            snapped=true;
            wassnapped=true;
        }
        else
        {
            snapped=false;
        }
    }

    outSnapped.set(snapped);
    outWasSnapped.set(wassnapped);
    
    if(inMax.get()!=inMin.get()!=0)
    {
        if(val>inMax.get())val=inMax.get();
        else if(val<inMin.get())val=inMin.get();
    }
    
    
    outVal.set(val);
    lastValue=val;

}

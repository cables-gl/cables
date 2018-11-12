var inArr=op.inArray("Array3x");
var inCalc=op.inTriggerButton("Calculate");
var outValue=op.outValue("Length");

var needsCalc=true;

inArr.onChange=function()
{
    needsCalc=true;
    
};


inCalc.onTriggered=function()
{
    if(needsCalc)
    {
        needsCalc=false;
        var arr=inArr.get();
        if(!arr || arr.length<3)
        {
            outValue.set(0);
            return;
        }
        
        var l=0;
        for(var i=3;i<arr.length;i+=3)
        {
        	var xd = arr[i-3]-arr[i+0];
        	var yd = arr[i-2]-arr[i+1];
        	var zd = arr[i-1]-arr[i+2];
            l+=Math.sqrt(xd*xd + yd*yd + zd*zd);
        }
        
        if(l!=l)l=0;
        outValue.set(l);
        
    }

};
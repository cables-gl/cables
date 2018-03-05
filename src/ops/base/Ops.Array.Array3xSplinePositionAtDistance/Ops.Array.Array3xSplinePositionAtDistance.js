var inExec=op.inFunctionButton("Calculate");
var inArr=op.inArray("Array3x");
var inDist=op.inValue("Distance");
var inNormalized=op.inValueBool("Normalized");

var outNext=op.outFunction("Next");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");

var outSplineLength=op.outValue("Spline Length");

var animX=new CABLES.Anim();
var animY=new CABLES.Anim();
var animZ=new CABLES.Anim();

var needsMapping=true;

function dist(x1,y1,z1,x2,y2,z2)
{
	var xd = x1-x2;
	var yd = y1-y2;
	var zd = z1-z2;
    return Math.sqrt(xd*xd + yd*yd + zd*zd);
}

function splineLength(arr)
{
    var l=0;
    for(var i=3;i<arr.length;i+=3)
    {
        l+=dist(arr[i-3],arr[i-2],arr[i-1],arr[i+0],arr[i+1],arr[i+2]);
    }
    
    outSplineLength.set(l);
    return l;
}

function mapArrays()
{
    animX.clear();
    animY.clear();
    animZ.clear();
    var arr=inArr.get();
    var sl=splineLength(arr);
    
    var distPos=0;
    
    for(var i=0;i<arr.length;i+=3)
    {
        var p=i/(arr.length-3);
        if(i>0)
        {
            distPos+=dist(arr[i-3],arr[i-2],arr[i-1],arr[i+0],arr[i+1],arr[i+2]);
        }

        animX.setValue(distPos,arr[i+0]);
        animY.setValue(distPos,arr[i+1]);
        animZ.setValue(distPos,arr[i+2]);
    }

    needsMapping=false;
}

inArr.onChange=function()
{
    needsMapping=true;
};


inExec.onTriggered=function()
{
    if(needsMapping)mapArrays();

    var d=inDist.get();
    if(inNormalized.get())d*=outSplineLength.get();
 
//  console.log(animX.getValue(d));
    
    outX.set(animX.getValue(d));
    outY.set(animY.getValue(d));
    outZ.set(animZ.getValue(d));
    
    outNext.trigger();
};



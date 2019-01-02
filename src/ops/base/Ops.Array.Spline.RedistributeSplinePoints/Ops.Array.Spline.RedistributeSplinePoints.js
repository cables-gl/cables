const
    inArr=op.inArray("Array3x"),
    num=op.inValueInt("Num Points",100),
    inExec=op.inTriggerButton("Calculate"),
    inNormalized=op.inValueBool("Normalized"),
    result=op.outArray("Result");

const
    animX=new CABLES.Anim(),
    animY=new CABLES.Anim(),
    animZ=new CABLES.Anim();

var needsMapping=true;
var newArray=[];
var totalSplineLength=0;

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

    return l;
}

function mapArrays()
{
    animX.clear();
    animY.clear();
    animZ.clear();
    var arr=inArr.get();
    if(!arr)
    {
        result.set([]);
        return;
    }
    totalSplineLength=splineLength(arr);

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

function buildResultArray()
{
    var n=Math.max(0,num.get());
    if(n===0)
    {
        result.set([]);
        return;
    }

    newArray.length=n*3;

    for(var i=0;i<n;i++)
    {
        newArray[i*3+0]=animX.getValue(i/n*totalSplineLength);
        newArray[i*3+1]=animY.getValue(i/n*totalSplineLength);
        newArray[i*3+2]=animZ.getValue(i/n*totalSplineLength);
    }

    result.set(null);
    result.set(newArray);
}

inArr.onChange=function()
{
    needsMapping=true;
};

inExec.onTriggered=function()
{
    if(needsMapping)mapArrays();
    buildResultArray();
};



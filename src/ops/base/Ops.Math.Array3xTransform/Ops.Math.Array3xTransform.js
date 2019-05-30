const
    inExec=op.inTriggerButton("Transform"),
    inArr=op.inArray("Array"),
    transX=op.inValue("Translate X"),
    transY=op.inValue("Translate Y"),
    transZ=op.inValue("Translate Z"),
    scaleX=op.inValueSlider("Scale X",1),
    scaleY=op.inValueSlider("Scale Y",1),
    scaleZ=op.inValueSlider("Scale Z",1),
    rotX=op.inValue("Rotation X"),
    rotY=op.inValue("Rotation Y"),
    rotZ=op.inValue("Rotation Z"),
    next=op.outTrigger("Next"),
    outArr=op.outArray("Result");

var resultArr=[];

inExec.onTriggered=doTransform;

var rotVec=vec3.create();
var emptyVec=vec3.create();
var transVec=vec3.create();
var centerVec=vec3.create();


function doTransform()
{
    var arr=inArr.get();
    if(!arr)
    {
        outArr.set(null);
        return;
    }

    resultArr.length=arr.length;

    for(var i=0;i<arr.length;i+=3)
    {
        resultArr[i+0]=arr[i+0]*scaleX.get();
        resultArr[i+1]=arr[i+1]*scaleY.get();
        resultArr[i+2]=arr[i+2]*scaleZ.get();

        resultArr[i+0]=resultArr[i+0]+transX.get();
        resultArr[i+1]=resultArr[i+1]+transY.get();
        resultArr[i+2]=resultArr[i+2]+transZ.get();
    }

    for(var i=0;i<arr.length;i+=3)
    {
        vec3.set(rotVec,
            resultArr[i+0],
            resultArr[i+1],
            resultArr[i+2]);

        if(rotX.get()!=0)vec3.rotateX(rotVec,rotVec,transVec,rotX.get()*CGL.DEG2RAD);
        if(rotY.get()!=0)vec3.rotateY(rotVec,rotVec,transVec,rotY.get()*CGL.DEG2RAD);
        if(rotZ.get()!=0)vec3.rotateZ(rotVec,rotVec,transVec,rotZ.get()*CGL.DEG2RAD);

        resultArr[i+0]=rotVec[0];
        resultArr[i+1]=rotVec[1];
        resultArr[i+2]=rotVec[2];
    }

    outArr.set(null);
    outArr.set(resultArr);
    next.trigger();
}
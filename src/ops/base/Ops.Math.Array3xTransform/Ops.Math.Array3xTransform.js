
var inExec=op.inFunctionButton("Transform");
var inArr=op.inArray("Array");



var transX=op.inValue("Translate X");
var transY=op.inValue("Translate Y");
var transZ=op.inValue("Translate Z");

var scaleX=op.inValueSlider("Scale X",1);
var scaleY=op.inValueSlider("Scale Y",1);
var scaleZ=op.inValueSlider("Scale Z",1);

var rotX=op.inValue("Rotation X");
var rotY=op.inValue("Rotation Y");
var rotZ=op.inValue("Rotation Z");



var outArr=op.outArray("Result");

var resultArr=[];


inExec.onTriggered=doTransform;

function doTransform()
{
    var arr=inArr.get();
    if(!arr)
    {
        outArr.set(null);
        return;
    }
    
    resultArr.length=arr.length;
    
    var rotVec=vec3.create();
    var emptyVec=vec3.create();
    var transVec=vec3.create();
    var centerVec=vec3.create();

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

        vec3.rotateX(rotVec,rotVec,transVec,rotX.get()*CGL.DEG2RAD);
        vec3.rotateY(rotVec,rotVec,transVec,rotY.get()*CGL.DEG2RAD);
        vec3.rotateZ(rotVec,rotVec,transVec,rotZ.get()*CGL.DEG2RAD);

        resultArr[i+0]=rotVec[0];
        resultArr[i+1]=rotVec[1];
        resultArr[i+2]=rotVec[2];


    }

  outArr.set(null);
  outArr.set(resultArr);

    
};
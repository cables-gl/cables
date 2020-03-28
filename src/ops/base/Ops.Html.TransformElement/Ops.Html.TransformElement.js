const
    exec=op.inTrigger("Exec"),
    inEle=op.inObject("Element"),
    next=op.outTrigger("Next"),
    inScale=op.inFloat("Scale",1),
    inOrtho=op.inBool("Orthogonal",false),
    inRotate=op.inFloat("Rotate",0),
    inAlignVert=op.inSwitch("Align Vertical",["Left","Center","Right"],"Left"),
    inAlignHor=op.inSwitch("Align Horizontal",["Top","Center","Bottom"],"Top");



const cgl=op.patch.cgl;
var x=0;
var y=0;
var m=mat4.create();
var pos=vec3.create();
var trans=vec3.create();

exec.onTriggered=setProperties;
op.onDelete=removeProperties;

var oldEle=null;


inAlignHor.onChange=
inAlignVert.onChange=
inRotate.onChange=
inScale.onChange=updateTransform;

function updateTransform()
{
    const ele=inEle.get();
    if(!ele)return;


    var translateStr="";
    if(inAlignVert.get()=="Left")translateStr="0%";
    if(inAlignVert.get()=="Center")translateStr="-50%";
    if(inAlignVert.get()=="Right")translateStr="-100%";

    translateStr+=", ";
    if(inAlignHor.get()=="Top")translateStr+="0%";
    if(inAlignHor.get()=="Center")translateStr+="-50%";
    if(inAlignHor.get()=="Bottom")translateStr+="-100%";


    const str="translate("+translateStr+") scale("+inScale.get()+") rotate("+inRotate.get()+"deg)";
    ele.style.transform=str;

}

inEle.onChange=function()
{
    updateTransform();
};

inEle.onLinkChanged = function()
{
    if(!inEle.isLinked())
    {
        if(oldEle)
        {
            removeProperties(oldEle);
        }
    }
    else
    {
        oldEle=inEle.get();
    }
    updateTransform();
};

function getScreenCoord()
{
    mat4.multiply(m,cgl.vMatrix,cgl.mMatrix);
    vec3.transformMat4(pos, [0,0,0], m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);


    var vp=cgl.getViewPort();

    if(inOrtho.get())
    {
        x=( ( cgl.canvasWidth  * 0.5 + trans[0] * cgl.canvasWidth * 0.5 / 1 ));
        y=( ( cgl.canvasHeight  * 0.5 - trans[1] * cgl.canvasHeight * 0.5 / 1 ));

    }
    else
    {
        x=( cgl.canvasWidth-( cgl.canvasWidth  * 0.5 - trans[0] * cgl.canvasWidth * 0.5 / trans[2] ));
        y=( cgl.canvasHeight-( cgl.canvasHeight  * 0.5 + trans[1] * cgl.canvasHeight * 0.5 / trans[2] ));
    }

    // console.log(x,y );


}

function setProperties()
{
    var ele=inEle.get();
    oldEle=ele;
    if(ele && ele.style)
    {
        getScreenCoord();
        var offsetTop = cgl.canvas.offsetTop;
        ele.style.top=offsetTop+y+'px';
        ele.style.left=x+'px';
    }

    next.trigger();
}

function removeProperties(ele)
{
    if(!ele) ele=inEle.get();
    if(ele && ele.style)
    {
        ele.style.top='initial';
        ele.style.left='initial';
        ele.style.transform='initial';

    }
}

op.addEventListener("onEnabledChange",function(enabled)
{
    if(enabled) setProperties();
        else removeProperties();
});

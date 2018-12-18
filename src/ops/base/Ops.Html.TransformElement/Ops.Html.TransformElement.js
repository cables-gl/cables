const exec=op.inTrigger("Exec");
const inEle=op.inObject("Element");
const next=op.outTrigger("Next");

const cgl=op.patch.cgl;
var x=0;
var y=0;
var m=mat4.create();
var pos=vec3.create();
var trans=vec3.create();

exec.onTriggered=setProperties;
op.onDelete=removeProperties;

var oldEle=null;

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
};

function getScreenCoord()
{
    mat4.multiply(m,cgl.vMatrix,cgl.mMatrix);
    vec3.transformMat4(pos, [0,0,0], m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);
    var vp=cgl.getViewPort();
    
    x=( vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] ));
    y=( vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] ));
}

function setProperties()
{
    var ele=inEle.get();
    oldEle=ele;
    if(ele)
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
    if(ele)
    {
        ele.style.top='initial';
        ele.style.left='initial';
    }
}

op.addEventListener("onEnabledChange",function(enabled)
{
    if(enabled) setProperties();
        else removeProperties();
});

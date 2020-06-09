const
    exec = op.inTrigger("Exec"),
    inEle = op.inObject("Element"),
    next = op.outTrigger("Next"),
    inScale = op.inFloat("Scale", 1),
    inOrtho = op.inBool("Orthogonal", false),
    inRotate = op.inFloat("Rotate", 0),
    inAlignVert = op.inSwitch("Align Vertical", ["Left", "Center", "Right"], "Left"),
    inAlignHor = op.inSwitch("Align Horizontal", ["Top", "Center", "Bottom"], "Top");

const cgl = op.patch.cgl;
let x = 0;
let y = 0;
let m = mat4.create();
let pos = vec3.create();
let trans = vec3.create();

exec.onTriggered = setProperties;
op.onDelete = removeProperties;

let oldEle = null;

inAlignHor.onChange =
    inAlignVert.onChange =
    inRotate.onChange =
    inScale.onChange = updateTransform;

function updateTransform()
{
    const ele = inEle.get();
    if (!ele) return;


    let translateStr = "";
    if (inAlignVert.get() == "Left")translateStr = "0%";
    if (inAlignVert.get() == "Center")translateStr = "-50%";
    if (inAlignVert.get() == "Right")translateStr = "-100%";

    translateStr += ", ";
    if (inAlignHor.get() == "Top")translateStr += "0%";
    if (inAlignHor.get() == "Center")translateStr += "-50%";
    if (inAlignHor.get() == "Bottom")translateStr += "-100%";


    const str = "translate(" + translateStr + ") scale(" + inScale.get() + ") rotate(" + inRotate.get() + "deg)";

    if(ele.style.transform!=str) ele.style.transform = str;
}

inEle.onChange = function ()
{
    updateTransform();
};

inEle.onLinkChanged = function ()
{
    if (!inEle.isLinked())
    {
        if (oldEle)
        {
            removeProperties(oldEle);
        }
    }
    else
    {
        oldEle = inEle.get();
    }
    updateTransform();
};

function getScreenCoord()
{
    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);
    vec3.transformMat4(pos, [0, 0, 0], m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    // console.log(cgl.pMatrix);

    let vp = cgl.getViewPort();

    const w = cgl.canvasWidth / cgl.pixelDensity;
    const h = cgl.canvasHeight / cgl.pixelDensity;

    if (inOrtho.get())
    {
        x = ((w * 0.5 + trans[0] * w * 0.5 / 1));
        y = ((h * 0.5 - trans[1] * h * 0.5 / 1));
    }
    else
    {
        x = (w - (w * 0.5 - trans[0] * w * 0.5)); //  / trans[2]
        y = (h - (h * 0.5 + trans[1] * h * 0.5)); //  / trans[2]
    }
}

function setProperties()
{
    let ele = inEle.get();
    oldEle = ele;
    if (ele && ele.style)
    {
        getScreenCoord();
        let offsetTop = cgl.canvas.offsetTop;

        const ypx=offsetTop + y + "px";
        const xpx=x + "px";

        if(ele.style.top!=ypx) ele.style.top = ypx;
        if(ele.style.left!=xpx) ele.style.left = xpx;
    }

    next.trigger();
}

function removeProperties(ele)
{
    if (!ele) ele = inEle.get();
    if (ele && ele.style)
    {
        ele.style.top = "initial";
        ele.style.left = "initial";
        ele.style.transform = "initial";
    }
}

op.addEventListener("onEnabledChange", function (enabled)
{
    if (enabled) setProperties();
    else removeProperties();
});

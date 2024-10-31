const
    exec = op.inTrigger("Exec"),
    inEle = op.inObject("Element"),
    inScale = op.inFloat("Scale", 1),
    inOrtho = op.inBool("Orthogonal", false),
    inRotate = op.inFloat("Rotate", 0),
    inHideBehind = op.inBool("Hide out of view", false),
    inAlignVert = op.inSwitch("Align Vertical", ["Left", "Center", "Right"], "Left"),
    inAlignHor = op.inSwitch("Align Horizontal", ["Top", "Center", "Bottom"], "Top"),
    inActive = op.inBool("Active", true),
    next = op.outTrigger("Next"),
    outEle = op.outObject("HTML Element", null, "element");

const cgl = op.patch.cgl;
let x = 0;
let y = 0;
let visible = 0;
const m = mat4.create();
const pos = vec3.create();
const trans = vec3.create();

let cachedTop = -1;
let cachedLeft = -1;
let currTransformStr = 0;

exec.onTriggered =
() =>
{
    if (!inActive.get()) return next.trigger();

    setProperties();
    next.trigger();
};

op.onDelete = removeProperties;

let oldEle = null;

inAlignHor.onChange =
    inAlignVert.onChange =
    inRotate.onChange =
    inScale.onChange = updateTransform;

function updateTransform()
{
    const ele = inEle.get();
    if (!ele)
    {
        oldEle = null;
        return;
    }

    let translateStr = "";
    if (inAlignVert.get() == "Left")translateStr = "0%";
    if (inAlignVert.get() == "Center")translateStr = "-50%";
    if (inAlignVert.get() == "Right")translateStr = "-100%";

    translateStr += ", ";
    if (inAlignHor.get() == "Top")translateStr += "0%";
    if (inAlignHor.get() == "Center")translateStr += "-50%";
    if (inAlignHor.get() == "Bottom")translateStr += "-100%";

    const str = "translate(" + translateStr + ") scale(" + inScale.get() + ") rotate(" + inRotate.get() + "deg)";

    // if (currTransformStr != str || oldEle != ele)
    if (ele.style.transform != str)
    {
        currTransformStr = str;
        ele.style.transform = str;
        outEle.setRef(ele);
    }
}

inEle.onChange = function ()
{
    const ele = inEle.get();
    if (!ele)
    {
        removeProperties(oldEle);

        oldEle = null;
        return;
    }

    updateTransform();
    setProperties();
};

inEle.onLinkChanged = function ()
{
    cachedLeft = -1;
    cachedTop = -1;

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

    const vp = cgl.getViewPort();

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

    visible = pos[2] < 0.0 && x > 0 && x < vp[2] && y > 0 && y < vp[3];
}

function setProperties()
{
    const ele = inEle.get();
    oldEle = ele;
    if (ele && ele.style)
    {
        getScreenCoord();
        const yy = cgl.canvas.offsetTop + y;

        const top = cgl.canvas.styleMarginTop || 0;

        if (yy + top != cachedTop)
        {
            ele.style.top = (yy + top) + "px";
            outEle.setRef(ele);
            cachedTop = yy;
        }

        const left = cgl.canvas.styleMarginLeft || 0;

        if (x + left != cachedLeft)
        {
            ele.style.left = (x + left) + "px";
            outEle.setRef(ele);
            cachedLeft = x;
        }

        if (inHideBehind.get())
        {
            if (visible)ele.style.display = "initial";
            else ele.style.display = "none";
        }
    }
}

function removeProperties(ele)
{
    cachedLeft = -1;
    cachedTop = -1;

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

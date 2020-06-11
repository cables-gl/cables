const
    inTex = op.inTexture("Texture"),
    inActive = op.inBool("Active", true),
    intrig = op.inTrigger("Trigger");


const ele = document.createElement("canvas");

let width=250;
let height=250;

ele.style.position = "absolute";
ele.style["z-index"] = 5;
ele.style.width = width+"px";
ele.style.height = height+"px";
ele.style["pointer-events"] = "none";
ele.style["transform-origin"]="top left";


document.body.appendChild(ele);
op.addEventListener("onUiAttribsChange", updatePos);


let wasPositioned=false;

const a = {};
let lastTime = 0;
let screenX = 0;
let screenY = 0;
let outOfCanvas = false;

gui.on("setLayout", updatePos);
gui.patchView.on("viewBoxChange", () =>
{
    updatePos();
});

op.onDelete = function ()
{
    ele.remove();
};

function updateOutOfCanvas()
{
    if (!gui.patchView.boundingRect) return;
    let old=outOfCanvas;
    outOfCanvas = false;
    if (screenX < -width || screenY < -height) outOfCanvas = true;
    if (screenX > gui.patchView.boundingRect.width + gui.patchView.boundingRect.x || screenY > gui.patchView.boundingRect.height + gui.patchView.boundingRect.y)
        outOfCanvas = true;

    if(outOfCanvas!=old)
    {
        if(outOfCanvas) ele.style.display="none";
        else ele.style.display="block";
    }
}

op.patch.cgl.on("beginFrame", () =>
{
    if (!gui || !wasPositioned) return;
    if (!inActive.get() || !inTex.get()) return;
    if (performance.now() - lastTime < 30) return;
    if (outOfCanvas) return;


    gui.metaTexturePreviewer._renderTexture(inTex, ele);
    lastTime = performance.now();
});


op.onAnimFrame = function (tt)
{

};

intrig.onTriggered = () =>
{
    a.updated = performance.now();
};

inTex.onChange = () =>
{
    if(!inTex.get()) ele.style.display="none";
    else ele.style.display="block";
};


function updatePos()
{
    const uiOp = gui.patch().getUiOp(op);

    if (!uiOp || !uiOp.oprect) return;
    const ctm = uiOp.oprect.getScreenCTM();


    ele.style.transform = "scale("+gui.patch()._viewBox._zoom+")";

    if (ctm)
    {
        screenX = ctm.e;
        screenY = ctm.f+(28*gui.patch()._viewBox._zoom);

        updateOutOfCanvas();

        if (outOfCanvas) return;

        const screenXpx = screenX + "px";
        const screenYpx = screenY + "px";

        if (screenXpx != ele.style.left) ele.style.left = screenXpx;
        if (screenYpx != ele.style.top) ele.style.top = screenYpx;

        wasPositioned=true;
    }
}

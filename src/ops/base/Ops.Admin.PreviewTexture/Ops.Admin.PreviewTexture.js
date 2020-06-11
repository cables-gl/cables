const inTex = op.inTexture("Texture");

const ele = document.createElement("canvas");

ele.style.position = "absolute";
ele.style["z-index"] = 999999;
ele.style.border = "4px solid black";
ele.style.width = "250px";
ele.style.height = "250px";
ele.style["pointer-events"] = "none";
document.body.appendChild(ele);
op.addEventListener("onUiAttribsChange", updatePos);

let a={};
let lastTime=0;

gui.on("setLayout",updatePos);
gui.patchView.on("viewBoxChange",updatePos);

op.onDelete=function()
{
    ele.remove();
};

op.patch.cgl.on("beginFrame", () =>
{
    if(performance.now()-lastTime<30)return;

    if(gui) gui.metaTexturePreviewer._renderTexture(inTex, ele);

    lastTime=performance.now();
});

function updatePos()
{
    const uiOp = gui.patch().getUiOp(op);

    if (!uiOp || !uiOp.oprect) return;
    const ctm = uiOp.oprect.getScreenCTM();

    if (ctm)
    {
        ele.style.left = ctm.e + "px";
        ele.style.top = ctm.f + 10 + "px";
    }
}


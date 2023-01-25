const
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    inUnit = op.inSwitch("Pixel Unit", ["Display", "CSS"], "Display"),
    pixelRatio = op.outNumber("Pixel Ratio"),
    aspect = op.outNumber("Aspect Ratio"),
    landscape = op.outBool("Landscape"),
    outCanvasEle = op.outObject("Canvas", "element"),
    outCanvasParentEle = op.outObject("Canvas Parent", "element");

let cgl = op.patch.cgl;
outCanvasEle.set(op.patch.cgl.canvas);
outCanvasParentEle.set(op.patch.cgl.canvas.parentElement);

cgl.on("resize", update);

inUnit.onChange = update;
update();

function update()
{
    let div = 1;
    if (inUnit.get() == "CSS")div = op.patch.cgl.pixelDensity;
    height.set(cgl.canvasHeight / div);
    width.set(cgl.canvasWidth / div);

    pixelRatio.set(op.patch.cgl.pixelDensity); // window.devicePixelRatio

    aspect.set(cgl.canvasWidth / cgl.canvasHeight);
    landscape.set(cgl.canvasWidth > cgl.canvasHeight ? 1 : 0);
}

const
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    pixelRatio = op.outNumber("Pixel Ratio"),
    widthPixel = op.outNumber("Pixel Width"),
    heightPixel = op.outNumber("Pixel Height"),
    inUnit = op.inSwitch("Pixel Unit", ["Display", "CSS"], "Display"),
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
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);

    heightPixel.set(cgl.canvasHeight * op.patch.cgl.pixelDensity);
    widthPixel.set(cgl.canvasWidth * op.patch.cgl.pixelDensity);

    pixelRatio.set(op.patch.cgl.pixelDensity); // window.devicePixelRatio

    aspect.set(cgl.canvasWidth / cgl.canvasHeight);
    landscape.set(cgl.canvasWidth > cgl.canvasHeight ? 1 : 0);
}

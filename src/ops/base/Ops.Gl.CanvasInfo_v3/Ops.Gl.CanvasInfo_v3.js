const
    width = op.outNumber("CSS Width"),
    height = op.outNumber("CSS Height"),
    pixelRatio = op.outNumber("Pixel Ratio"),
    widthPixel = op.outNumber("Pixel Width"),
    heightPixel = op.outNumber("Pixel Height"),
    aspect = op.outNumber("Aspect Ratio"),
    landscape = op.outBool("Landscape"),
    outCanvasEle = op.outObject("Canvas", "element"),
    outCanvasParentEle = op.outObject("Canvas Parent", "element"),
    outResize = op.outTrigger("Resized");

let cgl = op.patch.cgl;
outCanvasEle.set(op.patch.cgl.canvas);
outCanvasParentEle.set(op.patch.cgl.canvas.parentElement);

cgl.on("resize", () =>
{
    outResize.trigger();
    update();
});

update();

function update()
{
    let div = 1;

    if (cgl.canvasHeight == 0)setTimeout(update, 100);

    height.set(cgl.canvasHeight / op.patch.cgl.pixelDensity);
    width.set(cgl.canvasWidth / op.patch.cgl.pixelDensity);

    widthPixel.set(cgl.canvasWidth);
    heightPixel.set(cgl.canvasHeight);

    pixelRatio.set(op.patch.cgl.pixelDensity); // window.devicePixelRatio

    aspect.set(cgl.canvasWidth / cgl.canvasHeight);
    landscape.set(cgl.canvasWidth > cgl.canvasHeight ? 1 : 0);
}

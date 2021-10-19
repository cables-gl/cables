const
    width = op.outValue("width"),
    height = op.outValue("height"),
    pixelRatio = op.outValue("Pixel Ratio"),
    aspect = op.outValue("Aspect Ratio"),
    landscape = op.outBool("Landscape");

let cgl = op.patch.cgl;
cgl.addEventListener("resize", update);
update();

function update()
{
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);

    pixelRatio.set(op.patch.cgl.pixelDensity); // window.devicePixelRatio

    aspect.set(cgl.canvasWidth / cgl.canvasHeight);
    landscape.set(cgl.canvasWidth > cgl.canvasHeight ? 1 : 0);
}

const
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    pixelRatio = op.outNumber("Pixel Ratio"),
    aspect = op.outNumber("Aspect Ratio"),
    landscape = op.outBool("Landscape");

let cgl = op.patch.cgl;
cgl.on("resize", update);

update();

function update()
{
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);

    pixelRatio.set(op.patch.cgl.pixelDensity); // window.devicePixelRatio

    aspect.set(cgl.canvasWidth / cgl.canvasHeight);
    landscape.set(cgl.canvasWidth > cgl.canvasHeight ? 1 : 0);
}

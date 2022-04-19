const
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    inUnit = op.inSwitch("Pixel Unit", ["Display", "CSS"], "CSS"),
    pixelRatio = op.outNumber("Pixel Ratio"),
    aspect = op.outNumber("Aspect Ratio"),
    landscape = op.outBool("Landscape");

let cgl = op.patch.cgl;
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

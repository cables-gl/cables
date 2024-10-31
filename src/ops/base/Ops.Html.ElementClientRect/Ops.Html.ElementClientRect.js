const
    inUpd = op.inTriggerButton("Update"),
    inEle = op.inObject("Element", null, "element"),
    inUnits = op.inSwitch("Pixel Units", ["CSS Pixels", "Display Pixels"], "CSS Pixels"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height");

inEle.onChange =
inUpd.onTriggered = () =>
{
    let ele = inEle.get();
    if (!ele)
    {
        outX.set(0);
        outY.set(0);
        outWidth.set(0);
        outHeight.set(0);
        return;
    }
    const r = ele.getBoundingClientRect();
    const rCanv = op.patch.cgl.canvas.getBoundingClientRect();

    let mul = 1.0;

    if (inUnits.get() == "Display Pixels")
    {
        mul = op.patch.cgl.pixelDensity;
    }

    outX.set(r.left * mul - rCanv.left * mul);
    outY.set(r.top * mul - rCanv.top * mul);
    outWidth.set(r.width * mul);
    outHeight.set(r.height * mul);
};

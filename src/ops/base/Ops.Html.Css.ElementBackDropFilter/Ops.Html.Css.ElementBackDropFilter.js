const
    inEle = op.inObject("Element"),
    inBlur = op.inFloat("Blur", 0),

    inContrast = op.inFloatSlider("Contrast", 1),
    inBrightness = op.inFloatSlider("Brightness", 1),
    inHue = op.inFloatSlider("Hue", 0),
    inInvert = op.inFloatSlider("Invert", 0),
    inSaturate = op.inFloatSlider("Saturate", 1),
    inSepia = op.inFloatSlider("Sepia", 0),

    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inContrast.onChange =
inBrightness.onChange =
inHue.onChange =
inInvert.onChange =
inSaturate.onChange =
inSepia.onChange =
inEle.onChange =
inEle.onLinkChanged =
inBlur.onChange =
    update;

op.onDelete = remove;

function remove()
{
    if (ele)
        ele.style.removeProperty("backdrop-filter");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        let str = "";

        if (inBlur.get() != 0) str += "blur(" + inBlur.get() + "px) ";

        if (inContrast.get() != 1) str += "contrast(" + (inContrast.get() * 100) + "%) ";
        if (inBrightness.get() != 1) str += "brightness(" + inBrightness.get() * 100 + "%) ";
        if (inHue.get()) str += "hue-rotate(" + inHue.get() * 360 + "deg) ";
        if (inInvert.get()) str += "invert(" + inInvert.get() * 100 + "%) ";
        if (inSaturate.get() != 1) str += "saturate(" + inSaturate.get() * 100 + "%) ";
        if (inSepia.get() != 0) str += "sepia(" + inSepia.get() * 100 + "%) ";

        ele.style["backdrop-filter"] = str;
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}

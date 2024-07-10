const
    inEle = op.inObject("Element", null, "element"),
    inDoTranslate = op.inBool("Translate Active", true),
    inTransX = op.inFloat("Translate X", 0),
    inTransY = op.inFloat("Translate Y", 0),
    inTransUnit = op.inSwitch("Unit", ["px", "%"], "px"),

    inDoScale = op.inBool("Scale Active", true),
    inScale = op.inFloat("Scale", 1),

    inDoRot = op.inBool("Rotate Active", true),
    inRot = op.inFloat("Rot Z", 0),

    inDoOrigin = op.inBool("Set Origin", true),
    inOriginX = op.inSwitch("Origin X", ["left", "center", "right"], "center"),
    inOriginY = op.inSwitch("Origin Y", ["top", "center", "bottom"], "center"),
    outEle = op.outObject("Passthrough", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Translation", [inDoTranslate, inTransY, inTransX, inTransUnit]);
op.setPortGroup("Scaling", [inScale, inDoScale]);
op.setPortGroup("Rotation", [inDoRot, inRot]);
op.setPortGroup("Origin", [inDoOrigin, inOriginX, inOriginY]);

inTransUnit.onChange =
    inDoScale.onChange =
    inDoOrigin.onChange =
    inOriginX.onChange =
    inOriginY.onChange =
    inDoRot.onChange =
    inDoTranslate.onChange =
    inDoRot.onChange =
    inTransX.onChange =
    inTransY.onChange =
    inScale.onChange =
    inRot.onChange = update;

let ele = null;

inEle.onChange = inEle.onLinkChanged = function ()
{
    if (ele && ele.style)
    {
        ele.style.transform = "initial";
    }
    update();
    outEle.setRef(inEle.get());
};

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        let str = "";

        if (inDoTranslate.get())
            if (inTransY.get() || inTransX.get())
                str += "translate(" + inTransX.get() + inTransUnit.get() + " , " + inTransY.get() + inTransUnit.get() + ") ";

        if (inDoScale.get())
            if (inScale.get() != 1.0)
                str += "scale(" + inScale.get() + ") ";

        if (inDoRot.get())
            if (inRot.get() != 0.0)
                str += "rotateZ(" + inRot.get() + "deg) ";

        try
        {
            ele.style.transform = str;

            if (inDoOrigin.get())
                ele.style["transform-origin"] = inOriginY.get() + " " + inOriginX.get();
            else
                ele.style["transform-origin"] = "initial";
        }
        catch (e)
        {
            op.logError(e);
        }
    }
    else
    {
        setTimeout(update, 50);
    }
}

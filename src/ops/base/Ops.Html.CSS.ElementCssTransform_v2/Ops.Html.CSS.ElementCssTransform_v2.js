// todo: remove % unit, does not make sense, try container queries ?

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

    inDoZ = op.inBool("Z Index Active", false),
    inZ = op.inFloat("Z Index", 100),

    outEle = op.outObject("Passthrough", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Translation", [inDoTranslate, inTransY, inTransX, inTransUnit]);
op.setPortGroup("Scaling", [inScale, inDoScale]);
op.setPortGroup("Rotation", [inDoRot, inRot]);
op.setPortGroup("Origin", [inDoOrigin, inOriginX, inOriginY]);

inTransUnit.onChange =
    inOriginX.onChange =
    inOriginY.onChange =
    inTransX.onChange =
    inTransY.onChange =
    inScale.onChange =
    inZ.onChange =
    inRot.onChange = update;

let ele = null;
let timeoutUpd = null;

inDoTranslate.onChange =
    inDoOrigin.onChange =
    inDoScale.onChange =
    inDoZ.onChange =
    inDoRot.onChange = updateUi;

inEle.onChange = inEle.onLinkChanged = function ()
{
    if (ele && ele.style)
    {
        ele.style.transform = "initial";

        if (CABLES.UI && inEle.get() && ele != inEle.get())
        {
            if (window.getComputedStyle(ele).position !== "absolute") op.setUiError("oppos", "Element position should be absolute");
        }
    }
    if (CABLES.UI) op.setUiError("oppos", null);

    update();
    outEle.setRef(inEle.get());
};

function updateUi()
{
    inTransX.setUiAttribs({ "greyout": !inDoTranslate.get() });
    inTransY.setUiAttribs({ "greyout": !inDoTranslate.get() });
    inScale.setUiAttribs({ "greyout": !inDoScale.get() });
    inRot.setUiAttribs({ "greyout": !inDoRot.get() });
    inZ.setUiAttribs({ "greyout": !inDoZ.get() });
    inOriginY.setUiAttribs({ "greyout": !inDoOrigin.get() });
    inOriginX.setUiAttribs({ "greyout": !inDoOrigin.get() });

    update();
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        let str = "";

        if (inDoTranslate.get())
            str += "translate(" + inTransX.get() + inTransUnit.get() + " , " + inTransY.get() + inTransUnit.get() + ") ";

        if (inDoScale.get())
            if (inScale.get() != 1.0)
                str += "scale(" + inScale.get() + ") ";

        if (inDoRot.get())
            if (inRot.get() != 0.0)
                str += "rotateZ(" + inRot.get() + "deg) ";

        if (inDoZ.get())
            ele.style["z-index"] = inZ.get();

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

        outEle.setRef(ele);
    }
    else
    {
        clearTimeout(timeoutUpd);
        timeoutUpd = setTimeout(update, 150);
    }
}

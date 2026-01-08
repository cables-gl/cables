// todo: remove % unit, does not make sense, try container queries ?

const
    inEle = op.inObject("Element", null, "element"),
    inDoTranslate = op.inBool("Translate Active", true),

    inTransX = op.inFloat("Pos Left", 0),
    inTransXU = op.inSwitch("Pos Left Unit", ["Off", "px", "%"], "px"),

    inTransXR = op.inFloat("Pos Right", 0),
    inTransXRU = op.inSwitch("Pos Right Unit", ["Off", "px", "%"], "px"),

    inTransY = op.inFloat("Pos Top", 0),
    inTransYU = op.inSwitch("Pos Top Unit", ["Off", "px", "%"], "Off"),

    inTransYB = op.inFloat("Pos Bottom", 0),
    inTransYBU = op.inSwitch("Pos Bottom Unit", ["Off", "px", "%"], "Off"),

    inDoOrigin = op.inBool("Set Origin", true),

    inOffsetX = op.inFloat("Offset X", 0),
    inOffsetY = op.inFloat("Offset Y", 0),

    inDoZ = op.inBool("Z Index Active", false),
    inZ = op.inFloat("Z Index", 100),

    outEle = op.outObject("Passthrough", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Translation", [inDoTranslate]);

// inTransUnit.onChange =

inOffsetX.onChange =
inOffsetY.onChange =
inTransX.onChange =
    inTransXR.onChange =
    inTransY.onChange =
    inTransYB.onChange =
    inZ.onChange =
    update;

let ele = null;
let timeoutUpd = null;

inTransXU.onChange =
    inTransXRU.onChange =
    inTransYU.onChange =
    inTransYBU.onChange =

inDoTranslate.onChange =
    inDoOrigin.onChange =

    inDoZ.onChange = updateUi;

updateUi();

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
    inTransY.setUiAttribs({ "greyout": inTransYU.get() == "Off" });
    inTransYB.setUiAttribs({ "greyout": inTransYBU.get() == "Off" });
    inTransX.setUiAttribs({ "greyout": inTransXU.get() == "Off" });
    inTransXR.setUiAttribs({ "greyout": inTransXRU.get() == "Off" });

    update();
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        let str = "";

        if (inDoTranslate.get())
        {
            if (inTransYU.get() != "Off") ele.style.top = inTransY.get() + inTransYU.get();
            else ele.style.top = "";

            if (inTransYBU.get() != "Off") ele.style.bottom = inTransYB.get() + inTransYBU.get();
            else ele.style.bottom = "";

            if (inTransXU.get() != "Off") ele.style.left = inTransX.get() + inTransXU.get();
            else ele.style.left = "";

            if (inTransXRU.get() != "Off") ele.style.right = inTransXR.get() + inTransXRU.get();
            else ele.style.right = "";
        }

        try
        {
            str += "translate(" + inOffsetX.get() + "% , " + inOffsetY.get() + "%) ";
            ele.style.transform = str;
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

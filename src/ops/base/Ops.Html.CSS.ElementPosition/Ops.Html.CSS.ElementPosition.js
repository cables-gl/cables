// todo: remove % unit, does not make sense, try container queries ?

const
    inEle = op.inObject("Element", null, "element"),
    inDoTranslate = op.inBool("Translate Active", true),

    inTransYU = op.inSwitch("Pos Top Unit", ["Off", "px", "%"], "px"),
    inTransXU = op.inSwitch("Pos Left Unit", ["Off", "px", "%"], "px"),
    inTransXRU = op.inSwitch("Pos Right Unit", ["Off", "px", "%"], "Off"),
    inTransYBU = op.inSwitch("Pos Bottom Unit", ["Off", "px", "%"], "Off"),

    inTransY = op.inFloat("Pos Top", 0),
    inTransX = op.inFloat("Pos Left", 0),
    inTransXR = op.inFloat("Pos Right", 0),
    inTransYB = op.inFloat("Pos Bottom", 0),

    inDoOrigin = op.inBool("Set Origin", true),

    inOriginX = op.inSwitch("Origin X", ["Left", "Center", "Right"]),
    inOriginY = op.inSwitch("Origin Y", ["Top", "Center", "Bottom"]),

    inDoZ = op.inBool("Z Index Active", false),
    inZ = op.inFloat("Z Index", 100),

    outEle = op.outObject("Passthrough", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Translation", [inDoTranslate]);

inOriginX.onChange =
    inOriginY.onChange =
    inTransX.onChange =
    inTransXR.onChange =
    inTransY.onChange =
    inTransYB.onChange =
    inZ.onChange = update;

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

    inOriginX.setUiAttribs({ "greyout": !inDoOrigin.get() });
    inOriginY.setUiAttribs({ "greyout": !inDoOrigin.get() });

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
            if (inDoOrigin.get())
            {
                let x = "0%";
                let y = "0%";
                if (inOriginX.get() == "Center")x = "-50%";
                if (inOriginX.get() == "Right")x = "-100%";
                if (inOriginY.get() == "Bottom")y = "-100%";
                if (inOriginY.get() == "Center")y = "-50%";

                str += "translate(";
                str += x + " , ";
                str += y + "";
                str += ") ";
                ele.style.transform = str;
            }
            else
                ele.style.transform = "";
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

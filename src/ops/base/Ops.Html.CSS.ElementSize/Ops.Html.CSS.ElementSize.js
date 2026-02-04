// todo: remove % unit, does not make sense, try container queries ?

const
    inEle = op.inObject("Element", null, "element"),
    inWidth = op.inFloat("Width", 200),
    inWidthU = op.inSwitch("Pos Top Unit", ["Off", "px", "%"], "px"),
    inHeight = op.inFloat("Height", 200),
    inHeightU = op.inSwitch("Pos Left Unit", ["Off", "px", "%"], "px"),
    outEle = op.outObject("Passthrough", null, "element");

inHeight.onChange =
inWidth.onChange = update;

let ele = null;
let timeoutUpd = null;

updateUi();

inEle.onChange = inEle.onLinkChanged = function ()
{
    update();
    outEle.setRef(inEle.get());
};

function updateUi()
{
    inWidth.setUiAttribs({ "greyout": inWidthU.get() == "Off" });
    inHeight.setUiAttribs({ "greyout": inHeightU.get() == "Off" });

    update();
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        let str = "";

        if (inWidthU.get() != "Off") ele.style.width = inWidth.get() + inWidthU.get();
        else ele.style.width = "";

        if (inHeightU.get() != "Off") ele.style.height = inHeight.get() + inHeightU.get();
        else ele.style.height = "";

        outEle.setRef(ele);
    }
    else
    {
        clearTimeout(timeoutUpd);
        timeoutUpd = setTimeout(update, 150);
    }
}

const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inValue = op.inString("Value"),
    outEle = op.outObject("HTML Element", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue]);

inProperty.onChange = updateProperty;
inValue.onChange = update;
let ele = null;

const root = document.documentElement;
const varName = "propVar_" + CABLES.shortId();

inEle.onChange = inEle.onLinkChanged = function ()
{
    if (ele && ele.style)
    {
        ele.style[inProperty.get()] = "initial";
    }
    update();
};

function updateProperty()
{
    update();
    op.setUiAttrib({ "extendTitle": inProperty.get() + "" });
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        // let value = val.get();
        // if (quoted.get())
        // {
        //     value = "\"" + value + "\"";
        // }

        root.style.setProperty("--" + varName, inValue.get());

        /// //

        const str = "";
        try
        {
            if (ele.style[inProperty.get()] != str)
                ele.style[inProperty.get()] = "var(--" + varName + ")";
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

    outEle.setRef(inEle.get());
}

const
    inEle = op.inObject("Element"),
    active = op.inValueBool("active", true),
    filename = op.inUrl("image file"),
    inSize = op.inValueSelect("Size", ["auto", "length", "cover", "contain", "initial", "inherit", "75%", "50%", "40%", "30%", "25%", "20%", "10%"], "cover"),
    inRepeat = op.inValueSelect("Repeat", ["no-repeat", "repeat", "repeat-x", "repeat-y"], "no-repeat"),
    inPosition = op.inValueSelect("Position", ["left top", "left center", "left bottom", "right top", "right center", "right bottom", "center top", "center center", "center bottom"], "center center"),
    outEle = op.outObject("HTML Element");

op.onLoadedValueSet =
op.onLoaded =
inPosition.onChange =
inSize.onChange =
inEle.onChange =
inRepeat.onChange =
active.onChange =
filename.onChange = update;

let ele = null;
let cacheBust = null;

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        if (ele && ele.style)ele.style["background-image"] = "none";
        cacheBust = CABLES.uuid();
        update();
    }
};

function remove()
{
    if (ele)
    {
        ele.style["background-image"] = "none";
        ele.style["background-size"] = "initial";
        ele.style["background-position"] = "initial";
        ele.style["background-repeat"] = "initial";
    }
}

function update()
{
    if (!inEle.get())
    {
        remove();
        return;
    }

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });

    ele = inEle.get();

    if (ele && ele.style && filename.get())
    {
        if (!active.get())
        {
            ele.style["background-image"] = "none";
        }
        else
        {
            let cb = "";
            if (cacheBust)cb = "?cb=" + cacheBust;

            ele.style["background-image"] = "url(" + op.patch.getFilePath(String(filename.get())) + cb + ")";
            ele.style["background-size"] = inSize.get();
            ele.style["background-position"] = inPosition.get();
            ele.style["background-repeat"] = inRepeat.get();
        }
    }

    outEle.set(inEle.get());
}

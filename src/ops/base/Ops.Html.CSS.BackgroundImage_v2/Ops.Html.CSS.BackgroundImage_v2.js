const
    inEle = op.inObject("Element"),
    filename = op.inUrl("image file"),
    inSize = op.inValueSelect("Size", ["auto", "length", "cover", "contain", "initial", "inherit", "75%", "50%", "40%", "30%", "25%", "20%", "10%"], "cover"),
    inRepeat = op.inValueSelect("Repeat", ["no-repeat", "repeat", "repeat-x", "repeat-y"], "no-repeat"),
    inPosition = op.inValueSelect("Position", ["left top", "left center", "left bottom", "right top", "right center", "right bottom", "center top", "center center", "center bottom"], "center center"),
    active = op.inValueBool("active", true),
    inNotUnset = op.inValueBool("Never Unset", false),
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
            if (!inNotUnset.get()) ele.style["background-image"] = "none";
        }
        else
        {
            let cb = "";
            let url = op.patch.getFilePath(String(filename.get()));
            if (cacheBust)url = CABLES.cacheBust(url);

            ele.style["background-image"] = "url(" + url + ")";
            ele.style["background-size"] = inSize.get();
            ele.style["background-position"] = inPosition.get();
            ele.style["background-repeat"] = inRepeat.get();
        }
    }

    outEle.setRef(ele);
}

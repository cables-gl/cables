const
    inEle = op.inObject("Element"),
    filename = op.inUrl("image file"),
    inMode = op.inSwitch("Mode", ["background", "mask"], "background"),
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

inMode.onChange = () =>
{
    let otherMode = "mask";
    if (inMode.get() === "mask") otherMode = "background";
    remove(otherMode);
    update();
};

let ele = null;
let cacheBust = null;

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        const mode = inMode.get();
        if (ele && ele.style)ele.style[mode + "-image"] = "none";
        cacheBust = CABLES.uuid();
        update();
    }
};

function remove(mode)
{
    if (ele)
    {
        ele.style[mode + "-image"] = "none";
        ele.style[mode + "-size"] = "initial";
        ele.style[mode + "-position"] = "initial";
        ele.style[mode + "-repeat"] = "initial";
    }
}

function update()
{
    if (!inEle.get())
    {
        remove(inMode.get());
        return;
    }

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });

    ele = inEle.get();

    if (ele && ele.style && filename.get())
    {
        const mode = inMode.get();
        if (!active.get())
        {
            if (!inNotUnset.get()) ele.style[mode + "-image"] = "none";
        }
        else
        {
            let cb = "";
            let url = op.patch.getFilePath(String(filename.get()));
            if (cacheBust)url = CABLES.cacheBust(url);

            ele.style[mode + "-image"] = "url(" + url + ")";
            ele.style[mode + "-size"] = inSize.get();
            ele.style[mode + "-position"] = inPosition.get();
            ele.style[mode + "-repeat"] = inRepeat.get();
        }
    }

    outEle.setRef(ele);
}

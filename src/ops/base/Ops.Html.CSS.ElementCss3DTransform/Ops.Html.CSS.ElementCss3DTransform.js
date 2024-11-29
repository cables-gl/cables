const
    inEle = op.inObject("Element"),

    x = op.inFloat("X", 0),
    y = op.inFloat("Y", 0),
    z = op.inFloat("Z", 0),

    rotx = op.inFloat("Rot X", 0),
    roty = op.inFloat("Rot Y", 0),
    rotz = op.inFloat("Rot Z", 0),

    persp = op.inFloat("Perspective", 640),
    backface = op.inBool("Backface-Visibility", true),

    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inEle.onChange =
    inEle.onLinkChanged =
    backface.onChange =
    x.onChange = y.onChange = z.onChange =
    rotx.onChange = roty.onChange = rotz.onChange =
    persp.onChange = update;

op.onDelete = remove;

function remove()
{
    if (ele)
    {
        ele.style.removeProperty("perspective");
        ele.style.removeProperty("transform");
        ele.style.removeProperty("backface-visibility");
    }
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        let tr = "";

        tr += "translate3d(" + x.get() + "px," + y.get() + "px," + z.get() + "px) ";

        tr += "rotateX(" + rotx.get() + "deg)";
        tr += "rotateY(" + roty.get() + "deg)";
        tr += "rotateZ(" + rotz.get() + "deg)";

        ele.parentElement.style.perspective = persp.get() + "px";
        ele.style.transform = tr;
        ele.style["backface-visibility"] = backface.get() ? "visible" : "hidden";
    }
    else
    {
        setTimeout(update, 50);
    }

    if (outEle != inEle.get())
        outEle.setRef(inEle.get());
}

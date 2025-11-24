const
    inEle = op.inObject("Element", null, "element"),
    inColors = op.inArray("Color Array"),
    inColorPos = op.inArray("Color Pos Array"),
    inAngle = op.inFloat("Angle", 0),
    outEle = op.outObject("HTML Element", null, "element");

inAngle.onChange =
    inColors.onChange =
    inColorPos.onChange =
    inEle.onChange = update;

op.onDelete = remove;

let ele = null;
update();

function remove()
{
}

function update()
{
    ele = inEle.get();
    const arrCols = inColors.get();
    const arrPos = inColorPos.get();
    if (!ele) return;
    if (!arrCols) return;

    let str = "linear-gradient(" + inAngle.get() + "deg,";

    for (let i = 0; i < arrCols.length; i += 3)
    {
        let p = i / arrCols.length * 100;
        if (arrPos) p = arrPos[i / 3] * 100;
        str += "rgb(";
        str += Math.round(arrCols[i + 0] * 255);
        str += ",";
        str += Math.round(arrCols[i + 1] * 255);
        str += ",";
        str += Math.round(arrCols[i + 2] * 255);
        str += ",";
        str += 1;// arrCols[i+3]
        str += ") " + p + "% ";

        if (i < arrCols.length - 4) str += ",";
    }
    str += ")";

    ele.style.background = str;
}

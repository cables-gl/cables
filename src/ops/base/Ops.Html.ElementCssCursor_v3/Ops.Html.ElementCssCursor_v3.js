const
    inEle = op.inObject("Element", null, "element"),
    type = op.inSwitch("Type", ["Predefined", "File"], "Predefined"),
    cursorPort = op.inDropDown("CSS Cursors", ["auto", "crosshair", "pointer", "hand", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "ew-resize", "text", "wait", "help", "none"], "pointer"),
    filename = op.inUrl("file"),
    offX = op.inValueInt("Offset X"),
    offY = op.inValueInt("Offset Y"),
    inUserSelect = op.inSwitch("User Select", ["auto", "text", "none"], "auto"),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inUserSelect.onChange =
    offX.onChange = offY.onChange =
    type.onChange = filename.onChange =
    inEle.onChange = cursorPort.onChange =
        update;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("cursor");
    ele.style.removeProperty("user-select");
}

function update()
{
    remove();
    ele = inEle.get();

    if (!ele) return;

    cursorPort.setUiAttribs({ "greyout": type.get() != "Predefined" });
    filename.setUiAttribs({ "greyout": type.get() == "Predefined" });
    offX.setUiAttribs({ "greyout": type.get() == "Predefined" });
    offY.setUiAttribs({ "greyout": type.get() == "Predefined" });
    ele.style.userSelect = inUserSelect.get();
    if (ele && ele.style)
    {
        if (type.get() == "Predefined") ele.style.cursor = cursorPort.get();
        else
        {
            const str = "url(" + op.patch.getFilePath(String(filename.get())) + ") " + offX.get() + " " + offX.get() + ", auto";
            ele.style.cursor = str;
        }
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}

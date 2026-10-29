const
    varname = op.inString("Var Name"),
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random());

let root = document.documentElement;
let setName = null;
let oldValue = "";

op.onDelete = restore;

r.setUiAttribs({ "colorPick": true });
r.onChange =
    g.onChange =
    b.onChange =
    varname.onChange = update;

function toHex(c)
{
    c = (Math.floor(c * 255));
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function update()
{
    const name = "--" + varname.get();
    if (name != setName)
    {
        restore();
        if (!varname.get()) return;
        setName = name;
        oldValue = root.style.getPropertyValue(name);
    }

    const hex = "#" + toHex(r.get()) + toHex(g.get()) + toHex(b.get());
    root.style.setProperty(name, hex);
}

function restore()
{
    if (setName === null) return;
    if (oldValue) root.style.setProperty(setName, oldValue);
    else root.style.removeProperty(setName);
    setName = null;
}

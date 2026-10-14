const
    varname = op.inString("Var Name"),
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random());

let root = document.documentElement;

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
    const hex = "#" + toHex(r.get()) + toHex(g.get()) + toHex(b.get());
    root.style.setProperty("--" + varname.get(), hex);
}

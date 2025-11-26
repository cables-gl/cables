const
    inEle = op.inObject("Element", null, "element"),
    inType = op.inSwitch("Type", ["linear", "radial"], "linear"),
    inAngle = op.inFloat("Angle", 0),
    inGradient = op.inObject("Gradient Object", null, "gradient"),
    outEle = op.outObject("HTML Element", null, "element");

inGradient.onChange =
    inAngle.onChange =
    inType.onChange =
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
    const gr = inGradient.get();
    if (!gr) return console.log("no gr");
    if (!ele) return console.log("no ele");
    const keys = gr.keys;
    if (!keys) return console.log("no keys");

    let str = inType.get() + "-gradient(";
    if (inType.get() == "linear") str += inAngle.get() + "deg,";

    for (let i = 0; i < keys.length; i++)
    {
        let p = keys[i].pos * 100;
        str += "rgb(";
        str += Math.round(keys[i].r * 255);
        str += ",";
        str += Math.round(keys[i].g * 255);
        str += ",";
        str += Math.round(keys[i].b * 255);
        str += ",";
        str += keys[i].a;
        str += ") " + p + "% ";

        if (i < keys.length - 1) str += ",\n";
    }
    str += ")";
    // console.log("str",str);

    ele.style.background = str;
}

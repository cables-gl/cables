const
    inEle = op.inObject("Element", null, "element"),
    inType = op.inSwitch("Type", ["linear", "radial", "conic"], "linear"),
    inRCS = op.inDropDown("Rect Color Space", ["srgb", "srgb-linear",
        "hsl", "hwb", "lch", "lab", "oklab",
        "display-p3", "a98-rgb", "prophoto-rgb", "rec2020", "yz", "xyz-d50", "yz-d65"
    ], "srgb"),
    // inHue = op.inDropDown("Hue interpolation", ["shorter", "longer", "increasing", "decreasing"], "shorter"),
    inAngle = op.inFloat("Angle", 0),
    inGradient = op.inObject("Gradient Object", null, "gradient"),
    outEle = op.outObject("HTML Element", null, "element"),
    outStr = op.outString("CSS String");

// inHue.onChange =
inRCS.onChange =
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

    let str = "" + inType.get() + "-gradient(";

    str += "in " + inRCS.get();

    // str+=" longer hue to right"
    // str += " " + inHue.get() + " hue ";

    str += " ";

    if (inType.get() == "linear") str += inAngle.get() + "deg,";
    else str += ",";

    for (let i = 0; i < keys.length; i++)
    {
        let p = keys[i].pos * 100 + "% ";
        // if(inType.get()=="conic")p=(keys[i].pos * 360)+"deg";

        str += "rgb(";
        str += Math.round(keys[i].r * 255);
        str += ",";
        str += Math.round(keys[i].g * 255);
        str += ",";
        str += Math.round(keys[i].b * 255);
        str += ",";
        str += keys[i].a;
        str += ") " + p;

        if (i < keys.length - 1) str += ",\n";
    }
    str += ")";
    outStr.set(str);
    ele.style.background = "";
    ele.style.background = str;
}

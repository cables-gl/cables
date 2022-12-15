const
    inp = op.inObject("vec", null, "sg_vec4", null, "sg_vec4"),
    inType = op.inSwitch("Type", ["float", "vec2", "vec3", "vec4"], "vec4"),
    xChannel = op.inSwitch("X", ["X", "Y", "Z", "W"], "X"),
    yChannel = op.inSwitch("Y", ["X", "Y", "Z", "W"], "Y"),
    zChannel = op.inSwitch("Z", ["X", "Y", "Z", "W"], "Z"),
    wChannel = op.inSwitch("W", ["X", "Y", "Z", "W"], "W"),
    result = op.outObject("Result", null, "sg_vec4");

inType.onChange =
    xChannel.onChange =
    yChannel.onChange =
    zChannel.onChange =
    wChannel.onChange = updateUi;

const sgOp = new CGL.ShaderGraphOp(this);
updateUi();

function updateUi()
{
    yChannel.setUiAttribs({ "greyout": inType.get() == "float" });
    zChannel.setUiAttribs({ "greyout": inType.get() == "float" || inType.get() == "vec2" });
    wChannel.setUiAttribs({ "greyout": inType.get() == "float" || inType.get() == "vec2" || inType.get() == "vec3" });

    result.setUiAttribs({ "objType": "sg_" + inType.get() });

    let swizzStr = xChannel.get().toLowerCase();
    let str = "";

    // if (inType.get() == "float")
    // {
    //     str = swizzStr;
    //     str = inType.get() + " swizzle(" + inType.get() + " vec){return " + vec + "; }";
    // }
    // else
    {
        if (inType.get() == "float") swizzStr = "vec";
        if (inType.get() == "vec2" || inType.get() == "vec3" || inType.get() == "vec4") swizzStr += "vec." + yChannel.get().toLowerCase();
        if (inType.get() == "vec3" || inType.get() == "vec4") swizzStr += "vec." + zChannel.get().toLowerCase();
        if (inType.get() == "vec4") swizzStr += "vec." + wChannel.get().toLowerCase();

        str = inType.get() + " swizzle(" + inType.get() + " vec){return " + swizzStr + "; }";
    }

    console.log(str);
    sgOp.parseCode(str);
    console.log(sgOp.info);
    sgOp.updateGraph();
}

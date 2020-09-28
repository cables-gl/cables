
const
    render = op.inTrigger("Render"),

    // meth = op.inValueSelect("Mode", ["normal", "normal xy", "mul xyz", "mul xy", "sub x", "add x", "add xy", "add y", "add z", "mul y", "mul z", "sub z", "normal2", "normal RGB", "m14"], "normal"),
    extrude = op.inValue("Extrude", 0.5),
    meth = op.inSwitch("Mode", ["Norm", "Tang", "BiTang", "*", "+", "/"], "Normals"),
    axis = op.inSwitch("Axis", ["XYZ", "XY", "X", "Y", "Z"], "XYZ"),

    texture = op.inTexture("Texture"),
    channel = op.inSwitch("Channel", ["Luminance", "R", "G", "B", "A", "RGB"], "Luminance"),
    flip = op.inSwitch("Flip", ["None", "X", "Y", "XY"], "None"),
    range = op.inSwitch("Range", ["0-1", "1-0", "Normalized"], "0-1"),
    offsetX = op.inValueFloat("Offset X"),
    offsetY = op.inValueFloat("Offset Y"),

    calcNormals = op.inValueBool("Calc Normals", false),
    removeZero = op.inValueBool("Discard Zero Values"),
    colorize = op.inValueBool("colorize", false),
    colorizeMin = op.inValueSlider("Colorize Min", 0),
    colorizeMax = op.inValueSlider("Colorize Max", 1),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

op.setPortGroup("Input", [texture, flip, channel, range, offsetX, offsetY]);
op.setPortGroup("Colorize", [colorize, colorizeMin, colorizeMax]);

op.toWorkPortsNeedToBeLinked(texture, next, render);

render.onTriggered = dorender;

channel.onChange =
colorize.onChange =
axis.onChange =
    range.onChange =
    removeZero.onChange =
    flip.onChange =
    calcNormals.onChange =
    meth.onChange = updateDefines;

const srcHeadVert = attachments.vertdisplace_head_vert;
const srcBodyVert = attachments.vertdisplace_body_vert;


const srcHeadFrag = ""
    .endl() + "IN vec3 MOD_displHeightMapColor;"
    .endl() + "float MOD_map(float value, float inMin, float inMax, float outMin, float outMax) { return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);}"

    .endl();

const srcBodyFrag = ""
    .endl() + "#ifdef MOD_HEIGHTMAP_COLORIZE"
    .endl() + "   col.rgb*=MOD_map( MOD_displHeightMapColor, 0.0,1.0 , MOD_colorizeMin,MOD_colorizeMax);"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_DISPLACE_REMOVE_ZERO"
    .endl() + "   if(MOD_displHeightMapColor.r==0.0)discard;"
    .endl() + "#endif"
    .endl();


const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": srcHeadFrag,
    "srcBodyFrag": srcBodyFrag
});

mod.addUniformVert("t", "MOD_texture", 0);
mod.addUniformVert("f", "MOD_extrude", extrude);
mod.addUniformVert("f", "MOD_offsetX", offsetX);
mod.addUniformVert("f", "MOD_offsetY", offsetY);

mod.addUniformFrag("f", "MOD_colorizeMin", colorizeMin);
mod.addUniformFrag("f", "MOD_colorizeMax", colorizeMax);

updateDefines();


function updateDefines()
{
    mod.toggleDefine("MOD_HEIGHTMAP_COLORIZE", colorize.get());

    mod.toggleDefine("MOD_HEIGHTMAP_INVERT", range.get() == "1-0");
    mod.toggleDefine("MOD_HEIGHTMAP_NORMALIZE", range.get() == "Normalized");

    mod.toggleDefine("MOD_DISPLACE_REMOVE_ZERO", removeZero.get());

    mod.toggleDefine("MOD_INPUT_R", channel.get() == "R");
    mod.toggleDefine("MOD_INPUT_G", channel.get() == "G");
    mod.toggleDefine("MOD_INPUT_B", channel.get() == "B");
    mod.toggleDefine("MOD_INPUT_A", channel.get() == "A");
    mod.toggleDefine("MOD_INPUT_RGB", channel.get() == "RGB");
    mod.toggleDefine("MOD_INPUT_LUMI", channel.get() == "Luminance");

    mod.toggleDefine("MOD_FLIP_X", flip.get() == "X");
    mod.toggleDefine("MOD_FLIP_Y", flip.get() == "Y");
    mod.toggleDefine("MOD_FLIP_XY", flip.get() == "XY");

    mod.toggleDefine("MOD_AXIS_X", axis.get() == "X");
    mod.toggleDefine("MOD_AXIS_Y", axis.get() == "Y");
    mod.toggleDefine("MOD_AXIS_Z", axis.get() == "Z");
    mod.toggleDefine("MOD_AXIS_XYZ", axis.get() == "XYZ");
    mod.toggleDefine("MOD_AXIS_XY", axis.get() == "XY");


    mod.toggleDefine("MOD_MODE_BITANGENT", meth.get() == "BiTang");
    mod.toggleDefine("MOD_MODE_TANGENT", meth.get() == "Tang");
    mod.toggleDefine("MOD_MODE_NORMAL", meth.get() == "Norm");
    mod.toggleDefine("MOD_MODE_MUL", meth.get() == "*");
    mod.toggleDefine("MOD_MODE_ADD", meth.get() == "+");
    mod.toggleDefine("MOD_MODE_DIV", meth.get() == "/");
    mod.toggleDefine("MOD_SMOOTHSTEP", 0);


    // mod.toggleDefine("MOD_DISPLACE_METH_MULXYZ", meth.get() == "mul xyz");
    // mod.toggleDefine("MOD_DISPLACE_METH_MULXY", meth.get() == "mul xy");
    // mod.toggleDefine("MOD_DISPLACE_METH_ADDZ", meth.get() == "add z");
    // mod.toggleDefine("MOD_DISPLACE_METH_ADDY", meth.get() == "add y");
    // mod.toggleDefine("MOD_DISPLACE_METH_ADDX", meth.get() == "add x");
    // mod.toggleDefine("MOD_DISPLACE_METH_ADDXY", meth.get() == "add xy");
    // mod.toggleDefine("MOD_DISPLACE_METH_SUBX", meth.get() == "sub x");
    // mod.toggleDefine("MOD_DISPLACE_METH_MULY", meth.get() == "mul y");
    // mod.toggleDefine("MOD_DISPLACE_METH_MULZ", meth.get() == "mul z");
    // mod.toggleDefine("MOD_DISPLACE_METH_NORMAL", meth.get() == "normal");
    // mod.toggleDefine("MOD_DISPLACE_METH_NORMAL_XY", meth.get() == "normal xy");
    // mod.toggleDefine("MOD_DISPLACE_METH_NORMAL2", meth.get() == "normal2");

    // mod.toggleDefine("MOD_DISPLACE_METH_NORMAL_RGB", meth.get() == "normal RGB");
    // mod.toggleDefine("MOD_DISPLACE_METH_14", meth.get() == "m14");

    mod.toggleDefine("CALC_NORMALS", calcNormals.get());
}

function dorender()
{
    mod.bind();

    if (texture.get()) mod.pushTexture("MOD_texture", texture.get().tex);
    else mod.pushTexture("MOD_texture", CGL.Texture.getEmptyTexture(cgl).tex);

    next.trigger();

    mod.unbind();
}

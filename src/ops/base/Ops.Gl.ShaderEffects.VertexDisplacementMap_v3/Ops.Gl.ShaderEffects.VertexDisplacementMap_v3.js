
const
    render = op.inTrigger("render"),
    texture = op.inTexture("texture"),
    meth = op.inValueSelect("mode", ["normal", "normal xy", "mul xyz", "mul xy", "sub x", "add x", "add xy", "add y", "add z", "mul y", "mul z", "sub z", "normal2", "normal RGB", "m14"], "normal"),
    extrude = op.inValue("extrude", 0.5),
    flip = op.inValueBool("flip", false),
    calcNormals = op.inValueBool("Calc Normals", false),
    removeZero = op.inValueBool("Ignore Zero Values"),
    invert = op.inValueBool("invert"),
    offsetX = op.inValueFloat("offset X"),
    offsetY = op.inValueFloat("offset Y"),
    colorize = op.inValueBool("colorize", false),
    colorizeMin = op.inValueSlider("Colorize Min", 0),
    colorizeMax = op.inValueSlider("Colorize Max", 1),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

var uniExtrude, uniTexture;
const moduleFrag = null;
const moduleVert = null;

var uniTexture = null;
const uniTextureFrag = null;
var uniExtrude = null;
const uniOffsetX = null;
const uniOffsetY = null;
const uniColorizeMin = null;
const uniColorizeMax = null;

op.setPortGroup("Colorize", [colorize, colorizeMin, colorizeMax]);

op.toWorkPortsNeedToBeLinked(texture, next, render);


render.onTriggered = dorender;

colorize.onChange =
    invert.onChange =
    removeZero.onChange =
    flip.onChange =
    calcNormals.onChange =
    meth.onChange = updateDefines;

const srcHeadVert = attachments.vertdisplace_head_vert;
// ""
//     .endl() + "OUT float MOD_displHeightMapColor;"
//     .endl();

const srcBodyVert = attachments.vertdisplace_body_vert;

const srcHeadFrag = ""
    .endl() + "IN float MOD_displHeightMapColor;"
    .endl() + "float MOD_map(float value, float inMin, float inMax, float outMin, float outMax) { return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);}"

    .endl();

const srcBodyFrag = ""
    .endl() + "#ifdef MOD_HEIGHTMAP_COLORIZE"
    .endl() + "   col.rgb*=MOD_map( MOD_displHeightMapColor, 0.0,1.0 , MOD_colorizeMin,MOD_colorizeMax);"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_DISPLACE_REMOVE_ZERO"
    .endl() + "   if(MOD_displHeightMapColor==0.0)discard;"
    .endl() + "#endif"
    .endl();


const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
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
    mod.toggleDefine("MOD_HEIGHTMAP_INVERT", invert.get());
    mod.toggleDefine("MOD_DISPLACE_REMOVE_ZERO", removeZero.get());

    mod.toggleDefine("MOD_FLIPY", flip.get());
    mod.toggleDefine("MOD_DISPLACE_METH_MULXYZ", meth.get() == "mul xyz");
    mod.toggleDefine("MOD_DISPLACE_METH_MULXY", meth.get() == "mul xy");
    mod.toggleDefine("MOD_DISPLACE_METH_ADDZ", meth.get() == "add z");
    mod.toggleDefine("MOD_DISPLACE_METH_ADDY", meth.get() == "add y");
    mod.toggleDefine("MOD_DISPLACE_METH_ADDX", meth.get() == "add x");
    mod.toggleDefine("MOD_DISPLACE_METH_ADDXY", meth.get() == "add xy");
    mod.toggleDefine("MOD_DISPLACE_METH_SUBX", meth.get() == "sub x");
    mod.toggleDefine("MOD_DISPLACE_METH_MULY", meth.get() == "mul y");
    mod.toggleDefine("MOD_DISPLACE_METH_MULZ", meth.get() == "mul z");
    mod.toggleDefine("MOD_DISPLACE_METH_NORMAL", meth.get() == "normal");
    mod.toggleDefine("MOD_DISPLACE_METH_NORMAL_XY", meth.get() == "normal xy");
    mod.toggleDefine("MOD_DISPLACE_METH_NORMAL2", meth.get() == "normal2");

    mod.toggleDefine("MOD_DISPLACE_METH_NORMAL_RGB", meth.get() == "normal RGB");
    mod.toggleDefine("MOD_DISPLACE_METH_14", meth.get() == "m14");

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

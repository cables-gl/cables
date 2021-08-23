const cgl = op.patch.cgl;
// const id = "mod" + Math.floor(Math.random() * 10000);

op.render = op.inTrigger("render");
op.trigger = op.outTrigger("trigger");
const texture = op.inTexture("texture");
const extrude = op.inValue("extrude", 0.5);

const flip = op.inValueBool("flip", true);

const removeZero = op.inValueBool("Ignore Zero Values");
const invert = op.inValueBool("invert");
const offsetX = op.inValueFloat("offset X");
const offsetY = op.inValueFloat("offset Y");

const colorize = op.inValueBool("colorize");
const colorizeAdd = op.inValueSlider("colorize add");
const meth = op.inValueSelect("mode", ["normal", "normal xy", "mul xyz", "sub x", "add x", "add y", "add z", "mul y", "mul z", "sub z"]);

colorize.set(false);

function updateColorize()
{
    if (shader) shader.toggleDefine("MOD_HEIGHTMAP_COLORIZE", colorize.get());
}

function updateInvert()
{
    if (shader) shader.toggleDefine("MOD_HEIGHTMAP_INVERT", invert.get());
}

function updateRemoveZero()
{
    if (shader) shader.toggleDefine("MOD_DISPLACE_REMOVE_ZERO", removeZero.get());
}

colorize.onChange = updateColorize;
invert.onChange = updateInvert;
removeZero.onChange = updateRemoveZero;


const updateMethod = function ()
{
    if (shader)
    {
        // if(flip.get()) shader.define(id+'FLIPY');
        shader.toggleDefine(moduleVert.prefix + "FLIPY", flip.get());
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_MULXYZ", meth.get() == "mul xyz");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_ADDZ", meth.get() == "add z");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_ADDY", meth.get() == "add y");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_ADDX", meth.get() == "add x");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_SUBX", meth.get() == "sub x");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_MULY", meth.get() == "mul y");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_MULZ", meth.get() == "mul z");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_NORMAL", meth.get() == "normal");
        shader.toggleDefine(moduleVert.prefix + "DISPLACE_METH_NORMAL_XY", meth.get() == "normal xy");

        updateRemoveZero();
    }
};

flip.onChange = updateMethod;
meth.onChange = updateMethod;
meth.set("normal");

var shader = null;
var uniExtrude, uniTexture;


const srcHeadVert = ""
    .endl() + "UNI float MOD_extrude;"
    .endl() + "UNI sampler2D MOD_texture;"
    .endl() + "UNI float MOD_offsetX;"
    .endl() + "UNI float MOD_offsetY;"

    .endl() + "OUT float MOD_displHeightMapColor;"
    .endl();

const srcBodyVert = ""


    .endl() + "vec2 MOD_tc=texCoord;"
// .endl()+'vec2 MOD_tc=vec2(pos.x,pos.y);'

    .endl() + "#ifdef MOD_FLIPY"
    .endl() + "    MOD_tc.y=1.0-MOD_tc.y;"
    .endl() + "#endif"


    .endl() + "float MOD_texVal=texture2D( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) ).b;"

    .endl() + "#ifdef MOD_HEIGHTMAP_INVERT"
    .endl() + "   MOD_texVal=1.0-MOD_texVal;"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_MULXYZ"
    .endl() + "   MOD_texVal+=1.0;"
    .endl() + "   pos.xyz *= MOD_texVal * MOD_extrude;"
    // .endl()+'   norm=normalize(norm+normalize(pos.xyz+vec3(MOD_texVal)* MOD_extrude));'
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_ADDZ"
    .endl() + "   pos.z+=(MOD_texVal * MOD_extrude);"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_ADDY"
    .endl() + "   pos.y+=(MOD_texVal * MOD_extrude);"
    .endl() + "#endif"


    .endl() + "#ifdef MOD_DISPLACE_METH_ADDX"
    .endl() + "   pos.x+=(MOD_texVal * MOD_extrude);"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_SUBX"
    .endl() + "   pos.x-=(MOD_texVal * MOD_extrude);"
    .endl() + "#endif"


    .endl() + "#ifdef MOD_DISPLACE_METH_MULY"
    .endl() + "   pos.y+=((MOD_texVal-0.5) * MOD_extrude);"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_MULZ"
    .endl() + "   pos.z+=((MOD_texVal-0.5) * MOD_extrude);"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_NORMAL"
    .endl() + "   pos.xyz+=norm*MOD_texVal*MOD_extrude;"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_METH_NORMAL_XY"
    .endl() + "   pos.xy+=(pos.xy*MOD_texVal*MOD_extrude).xy;"
    // .endl()+'   pos.x+=(norm*MOD_texVal*MOD_extrude).x;'
    .endl() + "#endif"


    .endl() + "MOD_displHeightMapColor=MOD_texVal;"

    .endl();

const srcHeadFrag = ""
    .endl() + "UNI float MOD_colorizeAdd;"
    .endl() + "IN float MOD_displHeightMapColor;"
    .endl() + "UNI sampler2D MOD_texture;"
// .endl()+'IN vec3 vViewPosition;'

    .endl();

const srcBodyFrag = ""

    .endl() + "#ifdef MOD_HEIGHTMAP_COLORIZE"
    .endl() + "   col.rgb*=MOD_displHeightMapColor*(1.0-MOD_colorizeAdd);"
    .endl() + "   col+=MOD_colorizeAdd;"
    .endl() + "#endif"

    .endl() + "#ifdef MOD_DISPLACE_REMOVE_ZERO"
    .endl() + "if(MOD_displHeightMapColor==0.0)discard;"
    .endl() + "#endif"
    .endl();


let moduleFrag = null;
let moduleVert = null;

function removeModule()
{
    if (shader && moduleFrag) shader.removeModule(moduleFrag);
    if (shader && moduleVert) shader.removeModule(moduleVert);
    shader = null;
}


var uniTexture = null;
let uniTextureFrag = null;
var uniExtrude = null;
let uniOffsetX = null;
let uniOffsetY = null;
let uniColorizeAdd = null;

op.render.onLinkChanged = removeModule;

op.render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        op.trigger.trigger();
        return;
    }


    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();

        shader = cgl.getShader();

        moduleVert = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        uniTexture = new CGL.Uniform(shader, "t", moduleVert.prefix + "texture", 0);
        uniExtrude = new CGL.Uniform(shader, "f", moduleVert.prefix + "extrude", extrude);
        uniOffsetX = new CGL.Uniform(shader, "f", moduleVert.prefix + "offsetX", offsetX);
        uniOffsetY = new CGL.Uniform(shader, "f", moduleVert.prefix + "offsetY", offsetY);

        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "srcHeadFrag": srcHeadFrag,
                "srcBodyFrag": srcBodyFrag
            });
        uniTextureFrag = new CGL.Uniform(shader, "t", moduleVert.prefix + "texture", 0);
        uniColorizeAdd = new CGL.Uniform(shader, "f", moduleVert.prefix + "colorizeAdd", colorizeAdd);

        updateMethod();
        updateInvert();
        updateColorize();
    }


    if (!shader) return;
    const texSlot = moduleVert.num + 7;

    if (texture.get())
    {
        uniTexture.setValue(texSlot);
        uniTextureFrag.setValue(texSlot);
        cgl.setTexture(0 + texSlot, texture.get().tex);
    }

    op.trigger.trigger();
};

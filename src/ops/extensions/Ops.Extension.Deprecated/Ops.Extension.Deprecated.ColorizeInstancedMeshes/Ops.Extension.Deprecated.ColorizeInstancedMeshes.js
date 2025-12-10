const cgl = op.patch.cgl;

op.render = op.inTrigger("render");
op.trigger = op.outTrigger("trigger");

const inStrength = op.inValueSlider("Amount", 1);
const mulColor = op.inValueBool("Multiply Color");
const inLookup = op.inTexture("Lookup Texture");

let shader = null;

let srcBodyVert = ""
    .endl() + "#ifdef INSTANCING"
    .endl() + "instanceIndexFrag=instanceIndex;"
    .endl() + "#endif"
    .endl();

let srcHeadVert = ""
// .endl() + "#ifndef ATTRIB_instanceIndex"
// .endl() + "  #define ATTRIB_instanceIndex"

    // .endl() + "  IN float instanceIndex;"
    // .endl() + "#endif"
    // .endl() + "#ifndef ATTRIB_instanceIndexFrag"
    // .endl() + "  #define ATTRIB_instanceIndexFrag"
    .endl() + "  OUT float instanceIndexFrag;"
    // .endl() + "#endif"
    .endl();

let srcHeadFrag = ""

    .endl() + "UNI float MOD_strength;"
    .endl() + "#ifdef LOOKUPTEX"
    .endl() + "   UNI sampler2D MOD_lut;"
    .endl() + "#endif"
    // .endl() + "#ifndef ATTRIB_instanceIndexFrag"
    // .endl() + "  #define ATTRIB_instanceIndexFrag"
    .endl() + "  IN float instanceIndexFrag;"
    // .endl() + "#endif"
    .endl() + "float MOD_random(vec2 co)"
    .endl() + "{"
    .endl() + "   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 437511.5453);"
    .endl() + "}"

    .endl();

let moduleVert = null;
let moduleFrag = null;
function removeModule()
{
    if (shader && moduleVert) shader.removeModule(moduleVert);
    if (shader && moduleFrag) shader.removeModule(moduleFrag);
    shader = null;
}

mulColor.onChange = updateMulColor;
function updateMulColor()
{
    if (shader)
        if (mulColor.get())shader.define("MULCOLOR");
        else shader.removeDefine("MULCOLOR");
}

op.render.onLinkChanged = removeModule;

inLookup.onChange = updateLookupTexture;
function updateLookupTexture()
{
    if (shader)
    {
        if (inLookup.get())shader.define("LOOKUPTEX");
        else shader.removeDefine("LOOKUPTEX");
        inLookup.uniform = new CGL.Uniform(shader, "t", moduleFrag.prefix + "lut", 5);
    }
}

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

        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "srcHeadFrag": srcHeadFrag,
                "srcBodyFrag": attachments.colorize_instances_frag
            });

        inStrength.uniform = new CGL.Uniform(shader, "f", moduleFrag.prefix + "strength", inStrength);

        updateMulColor();
        updateLookupTexture();
    }

    if (inLookup.get())
    {
        cgl.setTexture(5, inLookup.get().tex);
        // mod.pushTexture("MOD_lut", inLookup.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inLookup.get().tex);
    }

    if (!shader) return;

    op.trigger.trigger();
};

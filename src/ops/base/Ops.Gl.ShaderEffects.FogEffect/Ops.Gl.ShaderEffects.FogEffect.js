const
    id = "mod" + Math.floor(Math.random() * 10000),
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inMode = op.inSwitch("Mode", ["Color", "R-Opacity"], "Color"),
    inStart = op.inValue("Start", 2),
    inEnd = op.inValue("End", 12),
    inAmount = op.inValueSlider("Amount", 0.5),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random());

const cgl = op.patch.cgl;
r.setUiAttribs({ "colorPick": true });

const srcHeadVert = ""
    .endl() + "OUT vec4 MOD_fogPos;"
    .endl();

const srcBodyVert = ""
    .endl() + "MOD_fogPos=viewMatrix*mMatrix*pos;"
    .endl();

const srcHeadFrag = ""
    .endl() + "IN vec4 MOD_fogPos;"
    .endl();

const srcBodyFrag = ""
    .endl() + "   float MOD_de=(MOD_fogPos.z+MOD_start)/(-1.0*MOD_end);"
    .endl() + "   float mx=clamp(MOD_de*MOD_amount,0.0,1.0);"
// .endl() + "       mx=1.0-mx;"

    .endl() + "#ifdef MOD_FOGMODE_ALPHA"
    .endl() + "       col.a*=mix(col.a,MOD_color.r,mx);"
    .endl() + "#endif"

    .endl() + "#ifndef MOD_FOGMODE_ALPHA"
    .endl() + "       col.rgb=mix(col.rgb,vec3(MOD_color.r,MOD_color.g,MOD_color.b), mx);"
    .endl() + "#endif"

// .endl() + "   #ifdef MOD_ALPHA"
// .endl() + "       col.a=1.0-clamp(MOD_de*MOD_amount,0.0,1.0);"
// .endl() + "   #endif"

    .endl();

const moduleFrag = null;
const moduleVert = null;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule(
    {
        "priority": 4,
        "title": op.name,
        "name": "MODULE_VERTEX_POSITION",
        "srcHeadVert": srcHeadVert,
        "srcBodyVert": srcBodyVert
    });

mod.addModule(
    {
        "title": op.name,
        "name": "MODULE_COLOR",
        "srcHeadFrag": srcHeadFrag,
        "srcBodyFrag": srcBodyFrag
    });

mod.addUniform("f", "MOD_amount", inAmount);
mod.addUniform("f", "MOD_start", inStart);
mod.addUniform("f", "MOD_end", inEnd);
mod.addUniform("3f", "MOD_color", r, g, b);

inMode.onChange = updateMode;

function updateMode()
{
    mod.toggleDefine("MOD_FOGMODE_ALPHA", inMode.get() == "R-Opacity");
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

const
    id = "mod" + Math.floor(Math.random() * 10000),
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

const srcHeadVert = ""
    .endl() + "OUT vec3 MOD_fragPos;"
    .endl();

const srcBodyVert = ""
    .endl() + "MOD_fragPos=(mMatrix*pos).xyz;"
    .endl();

const srcHeadFrag = attachments.head_frag;

const srcBodyFrag = ""
    .endl() + " normal = calculateNormal(MOD_fragPos);"
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
        "name": "MODULE_NORMAL",
        "srcHeadFrag": srcHeadFrag,
        "srcBodyFrag": srcBodyFrag
    });

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

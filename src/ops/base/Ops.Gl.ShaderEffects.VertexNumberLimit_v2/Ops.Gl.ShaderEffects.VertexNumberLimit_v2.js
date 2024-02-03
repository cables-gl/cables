const
    render = op.inTrigger("Render"),
    limitMin = op.inValueInt("Min", 0),
    limitMax = op.inValueInt("Max", 1000),
    inv = op.inBool("Invert", false);

const trigger = op.outTrigger("Next");
const cgl = op.patch.cgl;

const srcHeadVert = ""
    .endl() + "OUT float MOD_discard;"
    .endl();

const srcBodyVert = ""
    .endl() + "MOD_discard=1.0; "

    .endl() + "#ifndef MOD_INVERT"
    .endl() + "  if(attrVertIndex >= MOD_vertLimit.x && attrVertIndex <= MOD_vertLimit.y) MOD_discard=0.0; "
    .endl() + "#endif"

    .endl() + "#ifdef MOD_INVERT"
    .endl() + "  if(attrVertIndex < MOD_vertLimit.x || attrVertIndex > MOD_vertLimit.y) MOD_discard=0.0; "
    .endl() + "#endif"
    .endl();

const srcHeadFrag = ""
    .endl() + "IN float MOD_discard;"
    .endl();

const srcBodyFrag = ""
    .endl() + "if(MOD_discard>0.0) discard;"
    .endl();


const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    srcHeadVert,
    srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": srcHeadFrag,
    "srcBodyFrag": srcBodyFrag
});

mod.addUniform("2f", "MOD_vertLimit", limitMin, limitMax);
inv.onChange = updateDefines;


function updateDefines()
{
    mod.toggleDefine("MOD_INVERT", inv.get());
}

render.onTriggered = function ()
{
    mod.bind();
    trigger.trigger();
    mod.unbind();
};

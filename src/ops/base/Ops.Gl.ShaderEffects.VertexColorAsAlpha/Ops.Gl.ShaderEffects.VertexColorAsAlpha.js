const
    render = op.inTrigger("Render"),
    inInput = op.inSwitch("Input", ["Luminance", "R", "G", "B"], "default"),
    inInvert = op.inBool("Invert", false),
    next = op.outTrigger("Next");


const cgl = op.patch.cgl;

const srcHeadVert = ""
    .endl() + "IN vec3 attrVertColor;"
    .endl() + "OUT vec4 vertColor;"

    .endl();

const srcBodyVert = ""
    .endl() + "vertColor.rgb=attrVertColor;"
    .endl();

inInput.onChange =
    inInvert.onChange = updateDefines;

render.onTriggered = doRender;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    srcHeadVert,
    srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.colorarea_head_frag,
    "srcBodyFrag": attachments.colorarea_frag
});

updateDefines();


function updateDefines()
{
    mod.toggleDefine("MOD_INPUT_R", inInput.get() === "R");
    mod.toggleDefine("MOD_INPUT_G", inInput.get() === "G");
    mod.toggleDefine("MOD_INPUT_B", inInput.get() === "B");
    mod.toggleDefine("MOD_INPUT_LUMI", inInput.get() === "Luminance");
    mod.toggleDefine("MOD_INVERT", inInvert.get());
}



function doRender()
{
    mod.bind();
    next.trigger();

    mod.unbind();
}

const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

const srcHeadVert = ""
    .endl() + "IN vec4 attrVertColor;"
    .endl() + "OUT vec4 vertColor;"
    .endl();

const srcBodyVert = ""
    .endl() + "   vertColor=attrVertColor;"
    .endl();


render.onTriggered = doRender;

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    srcHeadVert,
    srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_BASE_COLOR",
    "srcHeadFrag": attachments.colorarea_head_frag,
    "srcBodyFrag": attachments.colorarea_frag
});


function doRender()
{
    mod.bind();
    next.trigger();

    mod.unbind();
}

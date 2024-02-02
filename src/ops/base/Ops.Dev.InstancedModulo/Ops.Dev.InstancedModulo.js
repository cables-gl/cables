const
    inTrigger = op.inTrigger("Trigger"),
    inWidth = op.inFloat("Width", 0),
    inHeight = op.inFloat("Height", 0),
    inX = op.inFloat("Pos X", 0),
    inY = op.inFloat("Pos Y", 0),
    next = op.outTrigger("Next");

inTrigger.onTriggered = render;

const cgl = op.patch.cgl;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.displace_head_vert || "",
    "srcBodyVert": attachments.displace_vert || ""
});

mod.addUniformVert("2f", "MOD_size", inWidth, inHeight);
mod.addUniformVert("2f", "MOD_pos", inX, inY);

function updateDefines()
{
}

function render()
{
    mod.bind();
    next.trigger();
    mod.unbind();
}

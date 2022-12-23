const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next");

const ports = [];
const cgl = op.patch.cgl;
const NUM_BUFFERS = 4;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.slots_head_frag,
    "srcBodyFrag": attachments.slots_frag,
});

mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.slots_head_vert,
    "srcBodyVert": attachments.slots_vert
});

for (let i = 0; i < NUM_BUFFERS; i++)
{
    let slot = "Default";
    if (i != 0)slot = "0";
    const p = op.inDropDown("Texture " + i, [
        "0", "1",
        "Position World",
        "Position Local",
        "TexCoord",
        "Default",
        "Normal",
        "Normal * ModelView",
        "Black",], slot);
    p.onChange = updateDefines;
    ports.push(p);
}

updateDefines();

function updateDefines()
{
    let strExt = "";
    let hasPosWorld = false;
    let hasPosLocal = false;
    let hasNormalModelView = false;

    for (let i = 0; i < NUM_BUFFERS; i++)
    {
        mod.toggleDefine("SLOT_TEX_" + i + "_NORMAL", ports[i].get() == "Normal");
        mod.toggleDefine("SLOT_TEX_" + i + "_COLOR", ports[i].get() == "Color" || ports[i].get() == "Default");
        mod.toggleDefine("SLOT_TEX_" + i + "_BLACK", ports[i].get() == "Black");
        mod.toggleDefine("SLOT_TEX_" + i + "_1", ports[i].get() == "1");
        mod.toggleDefine("SLOT_TEX_" + i + "_0", ports[i].get() == "0");

        hasPosWorld = (ports[i].get() == "Position World") || hasPosWorld;
        hasNormalModelView = (ports[i].get() == "Normal * ModelView") || hasNormalModelView;
        hasPosLocal = (ports[i].get() == "Position Local") || hasPosLocal;

        mod.toggleDefine("SLOT_TEX_" + i + "_POS_WORLD", ports[i].get() == "Position World");
        mod.toggleDefine("SLOT_TEX_" + i + "_POS_LOCAL", ports[i].get() == "Position Local");
        mod.toggleDefine("SLOT_TEX_" + i + "_TEXCOORD", ports[i].get() == "TexCoord");

        mod.toggleDefine("SLOT_TEX_" + i + "_NORMAL_MV", ports[i].get() == "Normal * ModelView");

        strExt += ports[i].get();
        if (i != NUM_BUFFERS - 1)strExt += " | ";
    }

    mod.toggleDefine("SLOT_POS_WORLD", hasPosWorld);
    mod.toggleDefine("SLOT_POS_LOCAL", hasPosLocal);
    mod.toggleDefine("SLOT_POS_NORMAL_MV", hasNormalModelView);

    op.setUiAttrib({ "extendTitle": strExt });
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

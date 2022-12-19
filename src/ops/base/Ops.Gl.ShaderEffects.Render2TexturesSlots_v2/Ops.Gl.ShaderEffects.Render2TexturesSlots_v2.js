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

for (let i = 0; i < NUM_BUFFERS; i++)
{
    let slot = "Color";
    if (i != 0)slot = "0";
    const p = op.inDropDown("Texture " + i, ["0", "1", "Color", "Normal", "Black",], slot);
    p.onChange = updateDefines;
    ports.push(p);
}

updateDefines();

function updateDefines()
{
    let strExt = "";

    for (let i = 0; i < NUM_BUFFERS; i++)
    {
        mod.toggleDefine("SLOT_TEX_" + i + "_NORMAL", ports[i].get() == "Normal");
        mod.toggleDefine("SLOT_TEX_" + i + "_COLOR", ports[i].get() == "Color");
        mod.toggleDefine("SLOT_TEX_" + i + "_BLACK", ports[i].get() == "Black");
        mod.toggleDefine("SLOT_TEX_" + i + "_1", ports[i].get() == "1");
        mod.toggleDefine("SLOT_TEX_" + i + "_0", ports[i].get() == "0");

        strExt += ports[i].get();
        if (i != NUM_BUFFERS - 1)strExt += " | ";
    }

    op.setUiAttrib({ "extendTitle": strExt });
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next");

const ports = [];
const cgl = op.patch.cgl;
const NUM_BUFFERS = 4;

const rt = new CGL.RenderTargets(cgl);

const mod = rt.mod;// new CGL.ShaderModifier(cgl, op.name);

for (let i = 0; i < NUM_BUFFERS; i++)
{
    let slot = "Default";
    if (i != 0)slot = "0";
    const p = op.inDropDown("Texture " + i, rt.getTypes(), slot);
    p.onChange = updateDefines;
    ports.push(p);
}

updateDefines();

function updateDefines()
{
    let types = [];
    for (let i = 0; i < NUM_BUFFERS; i++)
        types.push(ports[i].get());

    rt.update(types);

    op.setUiAttrib({ "extendTitle": rt.asString });
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

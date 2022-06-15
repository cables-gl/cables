const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inAmount = op.inValueSlider("Threshold", 0.3),
    inSetOne=op.inBool("Remove Alpha",false);

const cgl = op.patch.cgl;

inSetOne.onChange=updateDefines;

const mod = new CGL.ShaderModifier(cgl, op.name);

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": "",
    "srcBodyFrag": attachments.alpha_frag
});

mod.addUniformFrag("f", "MOD_threshold", inAmount);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("SETALPHAONE",inSetOne.get());
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

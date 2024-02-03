const
    render = op.inTrigger("render"),
    inMeth = op.inSwitch("Method", ["Normal", "Discard", "Coverage", "Cov. Sharp", "Dither", "None"], "Discard"),
    next = op.outTrigger("trigger"),
    inThresh = op.inValueSlider("Threshold", 0.3);

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

let atc = false;

inMeth.onChange = updateDefines;

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.alpha_head_frag,
    "srcBodyFrag": attachments.alpha_frag
});

mod.addUniformFrag("f", "MOD_threshold", inThresh);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("ALPHA_THRESHOLD", inMeth.get() == "Discard");
    mod.toggleDefine("ALPHA_ONE", inMeth.get() == "None");
    mod.toggleDefine("ALPHA_COVERAGE_SHARP", inMeth.get() == "Cov. Sharp");
    mod.toggleDefine("ALPHA_DITHERED", inMeth.get() == "Dither");

    inThresh.setUiAttribs({ "greyout": !(inMeth.get() == "Discard" || inMeth.get() == "Cov. Sharp") });

    atc = inMeth.get() == "Coverage" || inMeth.get() == "Cov. Sharp";
}

render.onTriggered = function ()
{
    if (atc) cgl.gl.enable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);

    mod.bind();
    next.trigger();
    mod.unbind();

    cgl.gl.disable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);
};

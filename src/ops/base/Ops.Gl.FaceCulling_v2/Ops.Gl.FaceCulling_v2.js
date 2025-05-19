const
    STR_FRONT = "Front Sides",
    STR_BACK = "Back Sides",
    STR_BOTH = "All",
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    facing = op.inSwitch("Discard", [STR_BACK, STR_FRONT, STR_BOTH], STR_BACK),
    enable = op.inValueBool("Active", true),
    cgl = op.patch.cgl;

op.setPortGroup("Face Fulling", [enable, facing]);
let whichFace = cgl.gl.BACK;
let updateFacing = true;

render.onTriggered = function ()
{
    const cg = op.patch.cg;
    if (!cg) return;

    if (updateFacing)
    {
        whichFace = cg.CULL_MODES[CABLES.CG.CULL_BACK];
        if (facing.get() == STR_FRONT) whichFace = cg.CULL_MODES[CABLES.CG.CULL_FRONT];
        else if (facing.get() == STR_BOTH) whichFace = cg.CULL_MODES[CABLES.CG.CULL_BOTH];
    }

    cg.pushCullFace(enable.get());
    cg.pushCullFaceFacing(whichFace);

    trigger.trigger();

    cg.popCullFace();
    cg.popCullFaceFacing();
};

enable.onChange = () =>
{
    facing.setUiAttribs({ "greyout": !enable.get() });
};

facing.onChange = () =>
{
    updateFacing = true;
};

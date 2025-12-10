const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    facing = op.inSwitch("Discard", ["none", "front", "back"], "back"),
    cgl = op.patch.cgl;

render.onTriggered = function ()
{
    const cg = op.patch.cg;
    if (!cg) return;

    cg.pushCullFaceFacing(facing.get());

    trigger.trigger();

    cg.popCullFaceFacing();
};

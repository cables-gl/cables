const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const renderer = new CABLES.ThreeRenderer(op);

exec.onTriggered = () =>
{
    renderer.renderPre();
    next.trigger();
    renderer.render();
};

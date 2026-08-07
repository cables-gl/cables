const
    exec = op.inTrigger("trigger"),
    next = op.outTrigger("next");

let rt = null;

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!rt)
    {
        rt = new MGPU.RenderTarget(mgpu);
    }

    rt.start();
    next.trigger();
    rt.end();

};

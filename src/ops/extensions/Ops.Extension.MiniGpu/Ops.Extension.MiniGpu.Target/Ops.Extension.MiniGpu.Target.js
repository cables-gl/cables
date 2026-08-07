const
    exec = op.inTrigger("trigger"),
    next = op.outTrigger("next"),
    tex = op.outObject("texture color");

let rt = null;

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!rt)
    {
        rt = new MGPU.RenderTarget(mgpu);

        tex.setRef(rt.colorTexture);
    }

    rt.start();
    next.trigger();
    rt.end();
};

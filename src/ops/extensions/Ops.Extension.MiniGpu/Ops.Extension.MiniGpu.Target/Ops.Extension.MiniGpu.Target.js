const
    exec = op.inTrigger("trigger"),
    next = op.outTrigger("next"),
    loadOp = op.inSwitch("loadOp", ["clear", "load"], "clear"),
    tex = op.outObject("texture color");

let rt = null;
loadOp.onChange = () =>
{
    rt = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!rt)
    {
        rt = new MGPU.RenderTarget(mgpu, { "loadOp": loadOp.get() });

        tex.setRef(rt.colorTexture);
    }

    rt.start();
    next.trigger();
    rt.end();
};

const
    exec = op.inTrigger("trigger"),
    next = op.outTrigger("next"),
    inWidth = op.inInt("Width", 0),
    inHeight = op.inInt("Height", 0),
    loadOp = op.inSwitch("loadOp", ["clear", "load"], "clear"),
    tex = op.outObject("texture color");

let rt = null;

inWidth.onChange =
    inHeight.onChange =
    loadOp.onChange = () =>
    {
        rt = null;
    };

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!rt)
    {
        rt = new MGPU.RenderTarget(mgpu, { "loadOp": loadOp.get(), "width": inWidth.get(), "height": inHeight.get() });

        tex.setRef(rt.colorTexture);
    }

    rt.start();
    next.trigger();
    rt.end();
};

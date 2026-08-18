const
    exec = op.inTrigger("trigger"),
    next = op.outTrigger("next"),
    inWidth = op.inInt("Width", 0),
    inHeight = op.inInt("Height", 0),
    loadOp = op.inSwitch("loadOp", ["clear", "load"], "clear"),
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random()),
    a = op.inFloatSlider("a", 1),
    tex = op.outObject("texture color", null, "texture");

r.setUiAttribs({ "colorPick": true });
let rt = null;

r.onChange =
    g.onChange = // TODO:color change should not resetup the rendertarget........
    b.onChange =
    a.onChange =
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
        rt = new MGPU.RenderTarget(mgpu,
            {
                "loadOp": loadOp.get(),
                "width": inWidth.get(),
                "height": inHeight.get(),
                "clearColor": [r.get(), g.get(), b.get(), a.get()]
            });

        tex.setRef(rt.colorTexture);
    }

    rt.start();
    next.trigger();
    rt.end();
};

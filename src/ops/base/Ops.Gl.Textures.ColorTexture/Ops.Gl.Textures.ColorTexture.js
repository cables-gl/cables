const
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1.0),
    texOut = op.outTexture("texture_out");

r.setUiAttribs({ "colorPick": true });
const cgl = op.patch.cgl;
let fb = null;
let wasFp = false;

r.onChange =
    g.onChange =
    b.onChange =
    a.onChange = () => { cgl.addNextFrameOnceCallback(render); };

cgl.addNextFrameOnceCallback(render);

function render()
{
    const fp = wasFp || r.get() < 0.0 || r.get() > 1.0 || g.get() < 0.0 || g.get() > 1.0 || b.get() < 0.0 || b.get() > 1.0;

    if (!fb || wasFp != fp)
    {
        if (fb)fb.dispose();
        if (cgl.glVersion == 1) fb = new CGL.Framebuffer(cgl, 8, 8, { "name": "colorTexture" });
        else fb = new CGL.Framebuffer2(cgl, 8, 8, { "name": "colorTexture", "depth": false, "isFloatingPointTexture": fp });
        fb.setFilter(CGL.Texture.FILTER_LINEAR);
        wasFp = fp;
    }

    fb.renderStart();
    cgl.gl.clearColor(r.get(), g.get(), b.get(), a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
    fb.renderEnd();
    texOut.setRef(fb.getTextureColor());
}

op.onDelete = () =>
{
    fb.dispose();
};

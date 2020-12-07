const
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1.0),
    texOut = op.outTexture("texture_out");

r.setUiAttribs({ "colorPick": true });
const cgl = op.patch.cgl;
let fb = null;

r.onChange =
    g.onChange =
    b.onChange =
    a.onChange = () => { cgl.addNextFrameOnceCallback(render); };

cgl.addNextFrameOnceCallback(render);

function render()
{
    if (!fb)
    {
        if (cgl.glVersion == 1) fb = new CGL.Framebuffer(cgl, 8, 8, { "name": "colorTexture" });
        else fb = new CGL.Framebuffer2(cgl, 8, 8, { "name": "colorTexture", "depth": false });
        fb.setFilter(CGL.Texture.FILTER_MIPMAP);
    }

    fb.renderStart();
    cgl.gl.clearColor(r.get(), g.get(), b.get(), a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
    fb.renderEnd();
    texOut.set(fb.getTextureColor());
}

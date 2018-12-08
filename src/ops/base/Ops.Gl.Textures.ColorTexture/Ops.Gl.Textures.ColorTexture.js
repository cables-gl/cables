const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
const a = op.inValueSlider("a", 1.0);
const texOut=op.outTexture("texture_out");

r.setUiAttribs({ colorPick: true });
const cgl=op.patch.cgl;

var fb=null;

r.onChange=
    g.onChange=
    b.onChange=
    a.onChange=render;

render();

function render()
{
    if(!fb)
    {
        if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,4,4);
            else fb=new CGL.Framebuffer2(cgl,4,4);
        fb.setFilter(CGL.Texture.FILTER_MIPMAP);
    }

    fb.renderStart();
    cgl.gl.clearColor(r.get(),g.get(),b.get(),a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
    fb.renderEnd();

    texOut.set(fb.getTextureColor());
}
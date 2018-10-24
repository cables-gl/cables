const r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
const g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

const texOut=op.outTexture("texture_out");

const cgl=op.patch.cgl;
var fb=null;

var render=function()
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
};

r.set(0.3);
g.set(0.3);
b.set(0.3);
a.set(1.0);

r.onChange=render;
g.onChange=render;
b.onChange=render;
a.onChange=render;

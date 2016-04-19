op.name='color texture';

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

var texOut=op.addOutPort(new Port(op,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

var cgl=op.patch.cgl;
var fb=null;

var render=function()
{
    if(!fb)
    {
        fb=new CGL.Framebuffer(cgl,4,4);
        fb.setFilter(CGL.Texture.FILTER_NEAREST);
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

r.onValueChange(render);
g.onValueChange(render);
b.onValueChange(render);
a.onValueChange(render);

render();
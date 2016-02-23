this.name='color texture';
var cgl=this.patch.cgl;

var texOut=this.addOutPort(new Port(this,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

var r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=this.addInPort(new Port(this,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

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
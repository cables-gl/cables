CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='color texture';

var texOut=this.addOutPort(new Port(this,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));

var r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=this.addInPort(new Port(this,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

r.set(0.3);
g.set(0.3);
b.set(0.3);
a.set(1.0);

var tex=new CGL.Texture(cgl);
tex.filter=CGL.Texture.FILTER_NEAREST;


var fb=null;

var render=function()
{
    if(!fb) fb=new CGL.Framebuffer(cgl,4,4);
    // fb.setSize(100,100);
    // cgl.gl.disable(cgl.gl.SCISSOR_TEST);

    fb.renderStart();
    cgl.gl.clearColor(r.get(),g.get(),b.get(),a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    fb.renderEnd();
    
    cgl.gl.clearColor(0,0,0,1);


    texOut.set(fb.getTextureColor());
};

r.onValueChange(render);
g.onValueChange(render);
b.onValueChange(render);
a.onValueChange(render);

render();
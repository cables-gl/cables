//Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='texture resize';
// var render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));

var width=this.addInPort(new Port(this,"width",CABLES.OP_PORT_TYPE_VALUE));
var height=this.addInPort(new Port(this,"height",CABLES.OP_PORT_TYPE_VALUE));

// var trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var texOut=this.addOutPort(new Port(this,"texture_out",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));

var tex=new CGL.Texture(cgl);
tex.filter=CGL.Texture.FILTER_MIPMAP;


var fb=null;

var render=function()
{
    // cgl.gl.disable(cgl.gl.SCISSOR_TEST);

    fb.renderStart();
    cgl.gl.clearColor(1,0,0,1);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    fb.renderEnd();
    cgl.gl.clearColor(0,0,0,1);

    texOut.set(fb.getTextureColor());
};

texOut.onPreviewChanged=function()
{
    if(self.texOut.showPreview) self.render.onTriggered=self.texOut.val.preview;
    else self.render.onTriggered=render;
};

function updateResolution()
{
    var w=width.get();
    var h=height.get();
    
    if(!fb) fb=new CGL.Framebuffer(cgl,w,h);
    else fb.setSize(w,h);
    render();
}

width.set(512);
height.set(512);
width.onValueChange(updateResolution);
height.onValueChange(updateResolution);
updateResolution();
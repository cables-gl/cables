var cgl=this.patch.cgl;

this.name='render to texture';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var useVPSize=this.addInPort(new Port(this,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var width=this.addInPort(new Port(this,"texture width"));
var height=this.addInPort(new Port(this,"texture height"));
var tfilter=this.addInPort(new Port(this,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var tex=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var texDepth=this.addOutPort(new Port(this,"textureDepth",OP_PORT_TYPE_TEXTURE));

var fb=new CGL.Framebuffer(cgl);

width.set(512);
height.set(512);
useVPSize.set(true);
tex.set( fb.getTextureColor() );
texDepth.set ( fb.getTextureDepth() );
tfilter.set('linear');

var onFilterChange=function()
{
    if(tfilter.get()=='nearest') fb.setFilter(CGL.Texture.FILTER_NEAREST);
    else if(tfilter.get()=='linear') fb.setFilter(CGL.Texture.FILTER_LINEAR);
    else if(tfilter.get()=='mipmap') fb.setFilter(CGL.Texture.FILTER_MIPMAP);
};

function doRender()
{
    if(useVPSize.val)
    {
        width.set( cgl.getViewPort()[2] );
        height.set( cgl.getViewPort()[3] );
    }

    if(fb.getWidth()!=width.get() || fb.getHeight()!=height.get() )
    {
        fb.setSize( width.get(),height.get() );
    }

    fb.renderStart(cgl);
    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.resetViewPort();
}

function preview()
{
    doRender();
    tex.val.preview();
}

tex.onPreviewChanged=function()
{
    if(tex.showPreview) render.onTriggered=preview;
    else render.onTriggered=doRender;
};

render.onTriggered=doRender;


tfilter.onValueChange(onFilterChange);

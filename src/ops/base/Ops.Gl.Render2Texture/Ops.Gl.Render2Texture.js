var cgl=op.patch.cgl;

op.name='render to texture';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var useVPSize=op.addInPort(new Port(op,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var width=op.addInPort(new Port(op,"texture width"));
var height=op.addInPort(new Port(op,"texture height"));
var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
// var tex=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
// var texDepth=op.addOutPort(new Port(op,"textureDepth",OP_PORT_TYPE_TEXTURE));

var tex=op.outTexture("texture");
var texDepth=op.outTexture("textureDepth");

var fpTexture=op.inValueBool("HDR");


var fb=null;//new CGL.Framebuffer(cgl,512,512);

width.set(512);
height.set(512);
useVPSize.set(true);
tfilter.set('linear');
var reInitFb=true;


// todo why does it only work when we render a mesh before>?>?????
// only happens with matcap material with normal map....



fpTexture.onChange=function()
{
    reInitFb=true;
};


var onFilterChange=function()
{
    reInitFb=true;
};

function doRender()
{
    
    if(!fb || reInitFb)
    {
        if(fb) fb.delete();
        if(cgl.glVersion>=2) fb=new CGL.Framebuffer2(cgl,8,8,{isFloatingPointTexture:fpTexture.get()});
            else fb=new CGL.Framebuffer(cgl,8,8,{isFloatingPointTexture:fpTexture.get()});

        if(tfilter.get()=='nearest') fb.setFilter(CGL.Texture.FILTER_NEAREST);
            else if(tfilter.get()=='linear') fb.setFilter(CGL.Texture.FILTER_LINEAR);
            else if(tfilter.get()=='mipmap') fb.setFilter(CGL.Texture.FILTER_MIPMAP);

        tex.set( fb.getTextureColor() );
        texDepth.set ( fb.getTextureDepth() );
        reInitFb=false;
    }
    
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
    
    // mesh.render(cgl.getShader());
    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.resetViewPort();
}


render.onTriggered=doRender;


tfilter.onValueChange(onFilterChange);

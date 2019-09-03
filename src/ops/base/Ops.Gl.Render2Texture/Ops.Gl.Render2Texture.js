const cgl=op.patch.cgl;

const
    render=op.inTrigger('render'),
    useVPSize=op.inValueBool("use viewport size",true),
    width=op.inValueInt("texture width",512),
    height=op.inValueInt("texture height",512),
    tfilter=op.inSwitch("filter",['nearest','linear','mipmap'],'linear'),
    msaa=op.inSwitch("MSAA",["none","2x","4x","8x"],"none"),
    trigger=op.outTrigger('trigger'),
    tex=op.outTexture("texture"),
    texDepth=op.outTexture("textureDepth"),
    fpTexture=op.inValueBool("HDR"),
    depth=op.inValueBool("Depth",true),
    clear=op.inValueBool("Clear",true);

var fb=null;
var reInitFb=true;
tex.set(CGL.Texture.getEmptyTexture(cgl));

op.setPortGroup('Alignment',[useVPSize,width,height,tfilter]);


// todo why does it only work when we render a mesh before>?>?????
// only happens with matcap material with normal map....

useVPSize.onChange=updateVpSize;
function updateVpSize()
{
    if(useVPSize.get())
    {
        width.setUiAttribs({greyout:true});
        height.setUiAttribs({greyout:true});
    }
    else
    {
        width.setUiAttribs({greyout:false});
        height.setUiAttribs({greyout:false});
    }
}

function initFbLater()
{
    reInitFb=true;
}

fpTexture.onChange=
    depth.onChange=
    clear.onChange=
    tfilter.onChange=
    msaa.onChange=initFbLater;

function doRender()
{
    if(!fb || reInitFb)
    {
        if(fb) fb.delete();
        if(cgl.glVersion>=2)
        {
            var ms=true;
            var msSamples=4;

            if(msaa.get()=="none")
            {
                msSamples=0;
                ms=false;
            }
            if(msaa.get()=="2x")msSamples=2;
            if(msaa.get()=="4x")msSamples=4;
            if(msaa.get()=="8x")msSamples=8;

            fb=new CGL.Framebuffer2(cgl,8,8,
            {
                isFloatingPointTexture:fpTexture.get(),
                multisampling:ms,
                depth:depth.get(),
                multisamplingSamples:msSamples,
                clear:clear.get()
            });
        }
        else
        {
            fb=new CGL.Framebuffer(cgl,8,8,{isFloatingPointTexture:fpTexture.get()});
        }

        if(tfilter.get()=='nearest') fb.setFilter(CGL.Texture.FILTER_NEAREST);
            else if(tfilter.get()=='linear') fb.setFilter(CGL.Texture.FILTER_LINEAR);
            else if(tfilter.get()=='mipmap') fb.setFilter(CGL.Texture.FILTER_MIPMAP);

        texDepth.set(fb.getTextureDepth());
        reInitFb=false;
    }

    if(useVPSize.val)
    {
        width.set( cgl.getViewPort()[2] );
        height.set( cgl.getViewPort()[3] );
    }

    if(fb.getWidth()!=Math.ceil(width.get()) || fb.getHeight()!=Math.ceil(height.get()) )
    {
        fb.setSize(
            Math.max(1,Math.ceil(width.get())),
            Math.max(1,Math.ceil(height.get())) );
    }

    fb.renderStart(cgl);

    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.resetViewPort();

    tex.set( fb.getTextureColor() );
}


render.onTriggered=doRender;
op.preRender=doRender;


updateVpSize();
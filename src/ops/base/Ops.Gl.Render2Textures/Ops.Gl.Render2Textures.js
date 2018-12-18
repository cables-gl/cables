const render=op.inTrigger("Render");
const trigger=op.outTrigger("Next");
const msaa=op.inValueSelect("MSAA",["none","2x","4x","8x"],"none");
const useVPSize=op.addInPort(new CABLES.Port(op,"use viewport size",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

const width=op.inValueInt("texture width");
const height=op.inValueInt("texture height");
const tfilter=op.inValueSelect("Filter",['nearest','linear','mipmap'],"none");

const tex0=op.outTexture("texture 0");
const tex1=op.outTexture("texture 1");
const tex2=op.outTexture("texture 2");
const tex3=op.outTexture("texture 3");

const texDepth=op.outTexture("textureDepth");

const fpTexture=op.inValueBool("HDR");
const depth=op.inValueBool("Depth",true);
const clear=op.inValueBool("Clear",true);


const cgl=op.patch.cgl;

var fb=null;
width.set(512);
height.set(512);
useVPSize.set(true);
tfilter.set('linear');
var reInitFb=true;

render.onTriggered=doRender;
tfilter.onValueChange(onFilterChange);
useVPSize.onChange=updateVpSize;

fpTexture.onChange=reInitLater;
depth.onChange=reInitLater();
clear.onChange=reInitLater();
var onFilterChange=reInitLater();
msaa.onChange=reInitLater();

updateVpSize();

function updateVpSize()
{
    if(useVPSize.get())
    {
        width.setUiAttribs({hidePort:true,greyout:true});
        height.setUiAttribs({hidePort:true,greyout:true});
    }
    else
    {
        width.setUiAttribs({hidePort:false,greyout:false});
        height.setUiAttribs({hidePort:false,greyout:false});
    }
}

function reInitLater()
{
    reInitFb=true;
}

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
                numRenderBuffers:4,
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

        tex0.set( fb.getTextureColorNum(0) );
        tex1.set( fb.getTextureColorNum(1) );
        tex2.set( fb.getTextureColorNum(2) );
        tex3.set( fb.getTextureColorNum(3) );
        texDepth.set( fb.getTextureDepth() );
        reInitFb=false;
    }

    if(useVPSize.val)
    {
        width.set( cgl.getViewPort()[2] );
        height.set( cgl.getViewPort()[3] );
    }

    if(fb.getWidth()!=Math.ceil(width.get()) || fb.getHeight()!=Math.ceil(height.get()) ) fb.setSize( width.get(),height.get() );

    fb.renderStart(cgl);
    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.resetViewPort();
}


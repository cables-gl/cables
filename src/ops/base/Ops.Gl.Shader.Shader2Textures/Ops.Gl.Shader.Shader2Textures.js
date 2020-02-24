const
    exec=op.inTrigger("Render"),
    inShader=op.inObject("Shader"),
    tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']),
    twrap=op.inValueSelect("wrap",['clamp to edge','repeat','mirrored repeat'],'clamp to edge'),
    inVPSize=op.inValueBool("Use Viewport Size",true),
    inWidth=op.inValueInt("Width",512),
    inHeight=op.inValueInt("Height",512),
    inFloatingPoint=op.inValueBool("Floating Point",false),
    next=op.outTrigger("Next"),
    outTex0=op.outTexture("Texture 1"),
    outTex1=op.outTexture("Texture 2"),
    outTex2=op.outTexture("Texture 3"),
    outTex3=op.outTexture("Texture 4");

const cgl=op.patch.cgl;
var prevViewPort=[0,0,0,0];
var effect=null;
var fb=null;
var tex=null;
var needInit=true;
const mesh=CGL.MESHES.getSimpleRect(cgl,"shader2texture rect");

inWidth.onChange=
    inHeight.onChange=
    inFloatingPoint.onChange=
    inVPSize.onChange=
    tfilter.onChange=
    twrap.onChange=initFbLater;

op.toWorkPortsNeedToBeLinked(inShader);

tfilter.set("nearest");

function initFbLater()
{
    needInit=true;
}

function initFb()
{
    if(cgl.glVersion<2)
    {
        console.warn('shader2textures only works with webgl2');
        return;
    }


    needInit=false;
    if(fb)fb.delete();
    fb=null;

    var w=inWidth.get();
    var h=inHeight.get();

    var filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') filter=CGL.Texture.FILTER_LINEAR;
        else if(tfilter.get()=='mipmap') filter=CGL.Texture.FILTER_MIPMAP;

    var selectedWrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if(twrap.get()=='repeat') selectedWrap=CGL.Texture.WRAP_REPEAT;
    if(twrap.get()=='mirrored repeat') selectedWrap=CGL.Texture.WRAP_MIRRORED_REPEAT;

    if(inVPSize.get())
    {
        inWidth.setUiAttribs({hidePort:true,greyout:true});
        inHeight.setUiAttribs({hidePort:true,greyout:true});

        w=cgl.getViewPort()[2];
        h=cgl.getViewPort()[3];
        inWidth.set(w);
        inHeight.set(h);
    }
    else
    {
        if(inWidth.uiAttribs.hidePort)
        {
            inWidth.setUiAttribs({hidePort:false,greyout:false});
            inHeight.setUiAttribs({hidePort:false,greyout:false});
        }
    }

    fb=new CGL.Framebuffer2(cgl,w,h,
    {
        isFloatingPointTexture:inFloatingPoint.get(),
        multisampling:false,
        wrap:selectedWrap,
        filter:filter,
        depth:true,
        multisamplingSamples:0,
        clear:true,
        numRenderBuffers:4
    });


}

exec.onTriggered=function()
{
    var vp=cgl.getViewPort();

    var shader=inShader.get();
    if(!shader)
    {
        outTex0.set(null);
        outTex1.set(null);
        outTex2.set(null);
        outTex3.set(null);
        return;
    }
    if(!fb || needInit )initFb();
    if(inVPSize.get() && fb && ( vp[2]!=fb.getTextureColor().width || vp[3]!=fb.getTextureColor().height ) )
    {
        initFb();
    }

    shader.setDrawBuffers([true,true,true,true]);

    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    fb.renderStart(cgl);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.pushShader(inShader.get());
    if(shader.bindTextures) shader.bindTextures();

    mesh.render(inShader.get());

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    outTex0.set( fb.getTextureColorNum(0) );
    outTex1.set( fb.getTextureColorNum(1) );
    outTex2.set( fb.getTextureColorNum(2) );
    outTex3.set( fb.getTextureColorNum(3) );

    cgl.popShader();

    cgl.gl.viewport(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3] );

    next.trigger();
};

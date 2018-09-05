var exec=op.inFunction("Render");
var inShader=op.inObject("Shader");
var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear']}));
// ,'mipmap'
const twrap=op.inValueSelect("wrap",['clamp to edge','repeat','mirrored repeat'],'clamp to edge');

var inVPSize=op.inValueBool("Use Viewport Size",true);
var inWidth=op.inValueInt("Width",512);
var inHeight=op.inValueInt("Height",512);
var inFloatingPoint=op.inValueBool("Floating Point",false);
var outTex=op.outTexture("Texture");

var prevViewPort=[0,0,0,0];
var cgl=op.patch.cgl;
var effect=null;

inWidth.onChange=initFbLater;
inHeight.onChange=initFbLater;
inFloatingPoint.onChange=initFbLater;
inVPSize.onChange=initFbLater;
tfilter.onChange=initFbLater;
twrap.onChange=initFbLater;

var fb=null;
var tex=null;
var needInit=true;
var mesh=CGL.MESHES.getSimpleRect(cgl,"shader2texture rect");

tfilter.set("nearest");

function initFbLater()
{
    needInit=true;
}

function initFb()
{
    needInit=false;
    if(fb)fb.delete();
    fb=null;
    
    var w=inWidth.get();
    var h=inHeight.get();

    var filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') filter=CGL.Texture.FILTER_LINEAR;
//        else if(tfilter.get()=='mipmap') filter=CGL.Texture.FILTER_MIPMAP;


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

    if(cgl.glVersion>=2) 
    {
        fb=new CGL.Framebuffer2(cgl,w,h,
        {
            isFloatingPointTexture:inFloatingPoint.get(),
            multisampling:false,
            wrap:selectedWrap,
            filter:filter,
            depth:true,
            multisamplingSamples:0,
            clear:true
        });
    }
    else
    {
        fb=new CGL.Framebuffer(cgl,inWidth.get(),inHeight.get(),
        {
            isFloatingPointTexture:inFloatingPoint.get(),
            filter:filter,
            wrap:selectedWrap
        });
    }
    


}

exec.onTriggered=function()
{
    var vp=cgl.getViewPort();
    
    // console.log();
    if(!fb || needInit )initFb();
    if(inVPSize.get() && fb && ( vp[2]!=fb.getTextureColor().width || vp[3]!=fb.getTextureColor().height ) )
    {
        initFb();
    }

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
    mat4.identity(cgl.mvMatrix);

    cgl.setShader(inShader.get());
    if(inShader.get().bindTextures) inShader.get().bindTextures();

    mesh.render(inShader.get());

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    outTex.set(fb.getTextureColor());

    cgl.setPreviousShader();
    
    cgl.gl.viewport(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3] );
};

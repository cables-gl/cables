var exec=op.inFunction("Render");
var inShader=op.inObject("Shader");

var inWidth=op.inValueInt("Width",512);
var inHeight=op.inValueInt("Height",512);
var inFloatingPoint=op.inValueBool("Floating Point",false);

var outTex=op.outTexture("Texture");

var prevViewPort=[0,0,0,0];
var cgl=op.patch.cgl;

var effect=null;


inWidth.onChange=initFb;
inHeight.onChange=initFb;
inFloatingPoint.onChange=initFb;

var tex=null;
var fb=null;
var mesh=CGL.MESHES.getSimpleRect(cgl,"shader2texture rect");

initFb();


function initFb()
{
    if(fb)fb.delete();
    fb=null;

    if(cgl.glVersion>=2) 
    {
        fb=new CGL.Framebuffer2(cgl,inWidth.get(),inHeight.get(),
        {
            isFloatingPointTexture:inFloatingPoint.get(),
            multisampling:false,
            depth:true,
            multisamplingSamples:0,
            clear:true
        });
    }
    else
    {
        fb=new CGL.Framebuffer(cgl,inWidth.get(),inHeight.get(),{isFloatingPointTexture:inFloatingPoint.get()});
    }
}

exec.onTriggered=function()
{
    var vp=cgl.getViewPort();
    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    if(!fb)initFb();

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
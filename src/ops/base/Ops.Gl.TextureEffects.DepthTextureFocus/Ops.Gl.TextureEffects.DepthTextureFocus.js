var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var image=op.addInPort(new CABLES.Port(op,"image",CABLES.OP_PORT_TYPE_TEXTURE));
var farPlane=op.addInPort(new CABLES.Port(op,"farplane",CABLES.OP_PORT_TYPE_VALUE));
var nearPlane=op.addInPort(new CABLES.Port(op,"nearplane",CABLES.OP_PORT_TYPE_VALUE));
var inInv=op.inValueBool("Invert",false);
var inFocus=op.inValueSlider("Center",0.5);
var inWidth=op.inValueSlider("Width",0.2);


farPlane.set(100.0);
nearPlane.set(0.1);

var cgl=op.patch.cgl;
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);

var srcFrag=attachments.depth_focus_frag||'';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniFarplane=new CGL.Uniform(shader,'f','f',farPlane);
var uniNearplane=new CGL.Uniform(shader,'f','n',nearPlane);
var uniFocus=new CGL.Uniform(shader,'f','focus',inFocus);
var uniwidth=new CGL.Uniform(shader,'f','width',inWidth);

inInv.onChange=function()
{
    if(inInv.get())shader.define("INVERT");
        else shader.removeDefine("INVERT");
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(image.val && image.val.tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();


        cgl.setTexture(0,image.get().tex);
        // cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};
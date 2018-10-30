var render=op.inTrigger('render');
var image=op.inTexture("image");
var farPlane=op.addInPort(new CABLES.Port(op,"farplane",CABLES.OP_PORT_TYPE_VALUE));
var nearPlane=op.addInPort(new CABLES.Port(op,"nearplane",CABLES.OP_PORT_TYPE_VALUE));
var inInv=op.inValueBool("Invert",false);
var trigger=op.outTrigger('trigger');

farPlane.set(100.0);
nearPlane.set(0.1);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.depthtexture_frag);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniFarplane=new CGL.Uniform(shader,'f','f',farPlane);
var uniNearplane=new CGL.Uniform(shader,'f','n',nearPlane);

inInv.onChange=function()
{
    if(inInv.get())shader.define("INVERT");
        else shader.removeDefine("INVERT");
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(image.val && image.val.tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};
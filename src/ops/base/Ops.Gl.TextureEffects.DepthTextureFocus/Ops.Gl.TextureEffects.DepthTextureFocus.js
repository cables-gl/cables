const render=op.inTrigger('render');
const image=op.inTexture("image");
const farPlane=op.inValue("farplane",100);
const nearPlane=op.inValue("nearplane",0.1);
const inInv=op.inValueBool("Invert",false);
const inFocus=op.inValueSlider("Center",0.5);
const inWidth=op.inValueSlider("Width",0.2);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;

const shader=new CGL.Shader(cgl);
const srcFrag=attachments.depth_focus_frag||'';
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','image',0);
const uniFarplane=new CGL.Uniform(shader,'f','f',farPlane);
const uniNearplane=new CGL.Uniform(shader,'f','n',nearPlane);
const uniFocus=new CGL.Uniform(shader,'f','focus',inFocus);
const uniwidth=new CGL.Uniform(shader,'f','width',inWidth);

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
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();


        cgl.setTexture(0,image.get().tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
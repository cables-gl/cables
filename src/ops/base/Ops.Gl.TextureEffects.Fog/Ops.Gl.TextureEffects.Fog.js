

var render=op.inTrigger('render');
var density=op.inValueFloat("density");
var image=op.inTexture("depth texture");
var trigger=op.outTrigger('trigger');
var ignoreInf=op.inValueBool("ignore infinity");

ignoreInf.set(false);
ignoreInf.onChange=function()
{
    if(ignoreInf.get()) shader.define('FOG_IGNORE_INFINITY');
        else shader.removeDefine('FOG_IGNORE_INFINITY');
};

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


var srcFrag=attachments.fog_frag;

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','depthTex',1);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniDensity=new CGL.Uniform(shader,'f','density',1.0);
density.onChange=function()
{
    uniDensity.setValue(density.get());
};
density.set(5.0);


    // fog color

const r = op.inValueSlider("fog r", Math.random());
const g = op.inValueSlider("fog g", Math.random());
const b = op.inValueSlider("fog b", Math.random());
r.setUiAttribs({ colorPick: true });

const rUniform=new CGL.Uniform(shader,'f','r',r);
const gUniform=new CGL.Uniform(shader,'f','g',g);
const bUniform=new CGL.Uniform(shader,'f','b',b);


const a=op.inValueSlider("fog a",1.0);
const aUniform=new CGL.Uniform(shader,'f','a',a);


var start=op.inValueSlider("start");
start.onChange=function()
{
    if(!start.uniform) start.uniform=new CGL.Uniform(shader,'f','start',start.get());
    else start.uniform.setValue(start.get());
};
start.set(0);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(image.get() && image.get().tex)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        cgl.setTexture(1, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
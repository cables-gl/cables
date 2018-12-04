const render=op.inTrigger("render");
const texture=op.inTexture("texture");

const inMode=op.inValueSelect("Mode",["G","R","COLOR"],"COLOR");
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;

render.onTriggered=doRender;

var textureUniform=null;
var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.chromakeymaterial_vert,attachments.chromakeymaterial_frag);
shader.define('MODE_COLOR');

function doRender()
{
    if(shader)
    {
        cgl.setShader(shader);
        shader.bindTextures();
        trigger.trigger();
        cgl.setPreviousShader();
    }
}

shader.bindTextures=function()
{
    if(texture.get()) cgl.setTexture(0, texture.val.tex);

};

inMode.onChange=function()
{
    shader.removeDefine('MODE_G');
    shader.removeDefine('MODE_R');
    shader.removeDefine('MODE_COLOR');
    if(inMode.get()=="R") shader.define('MODE_R');
    else if(inMode.get()=="G") shader.define('MODE_G');
    else if(inMode.get()=="COLOR") shader.define('MODE_COLOR');

};

texture.onChange=function()
{
    if(texture.get())
    {
        if(textureUniform!==null)return;
        shader.removeUniform('tex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
    else
    {
        shader.removeUniform('tex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        textureUniform=null;
    }
};

var w=op.addInPort(new CABLES.Port(op,"weightMul",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
w.set(0.6);
w.uniform=new CGL.Uniform(shader,'f','weightMul',w);

var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
r.set(0.467);
r.uniform=new CGL.Uniform(shader,'f','r',r);

var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
g.set(0.836);
g.uniform=new CGL.Uniform(shader,'f','g',g);

var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
b.set(0.098);
b.uniform=new CGL.Uniform(shader,'f','b',b);

var white=op.addInPort(new CABLES.Port(op,"white",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
white.set(0.0);
white.uniform=new CGL.Uniform(shader,'f','white',white);

const diffuseRepeatX=op.inValue("diffuseRepeatX",1);
const diffuseRepeatY=op.inValue("diffuseRepeatY",1);

const diffuseOffsetX=op.inValue("Tex Offset X",0);
const diffuseOffsetY=op.inValue("Tex Offset Y",0);

const diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX);
const diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY);
const diffuseOffsetXUniform=new CGL.Uniform(shader,'f','texOffsetX',diffuseOffsetX);
const diffuseOffsetYUniform=new CGL.Uniform(shader,'f','texOffsetY',diffuseOffsetY);




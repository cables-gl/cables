const cgl=op.patch.cgl;

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION) );
var trigger=op.outTrigger('trigger');
var shaderOut=op.addOutPort(new CABLES.Port(op,"shader",CABLES.OP_PORT_TYPE_OBJECT));

var pointSize=op.addInPort(new CABLES.Port(op,"PointSize",CABLES.OP_PORT_TYPE_VALUE));
var randomSize=op.inValue("Random Size",3);

var makeRound=op.addInPort(new CABLES.Port(op,"Round",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
var doScale=op.addInPort(new CABLES.Port(op,"Scale by Distance",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var preMultipliedAlpha=op.addInPort(new CABLES.Port(op,"preMultiplied alpha",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));


makeRound.set(true);
doScale.set(false);
pointSize.set(3);


var shader=new CGL.Shader(cgl,'PointMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

shader.define('MAKE_ROUND');

var uniPointSize=new CGL.Uniform(shader,'f','pointSize',pointSize);
var uniRandomSize=new CGL.Uniform(shader,'f','randomSize',randomSize);


shaderOut.set(shader);
shader.setSource(attachments.shader_vert,attachments.shader_frag);
shader.glPrimitive=cgl.gl.POINTS;
shader.bindTextures=bindTextures;
shaderOut.ignoreValueSerialize=true;

r.set(Math.random());
g.set(Math.random());
b.set(Math.random());
a.set(1.0);

r.uniform=new CGL.Uniform(shader,'f','r',r);
g.uniform=new CGL.Uniform(shader,'f','g',g);
b.uniform=new CGL.Uniform(shader,'f','b',b);
a.uniform=new CGL.Uniform(shader,'f','a',a);

var uniWidth=new CGL.Uniform(shader,'f','canvasWidth',cgl.canvasWidth);
var uniHeight=new CGL.Uniform(shader,'f','canvasHeight',cgl.canvasHeight);

render.onTriggered=doRender;

var texture=op.inTexture("texture");
var textureUniform=null;

var textureMask=op.inTexture("Texture Mask");
var textureMaskUniform=null;

op.preRender=function()
{
    if(shader)shader.bind();
    doRender();
};

function bindTextures()
{
    if(texture.get()) cgl.setTexture(0,texture.get().tex);
    if(textureMask.get()) cgl.setTexture(1,textureMask.get().tex);
}

function doRender()
{
    uniWidth.setValue(cgl.canvasWidth);
    uniHeight.setValue(cgl.canvasHeight);

    cgl.setShader(shader);
    bindTextures();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    trigger.trigger();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setPreviousShader();
}

doScale.onChange=function()
{
    if(doScale.get()) shader.define('SCALE_BY_DISTANCE');
        else shader.removeDefine('SCALE_BY_DISTANCE');
};

makeRound.onChange=function()
{
    if(makeRound.get()) shader.define('MAKE_ROUND');
        else shader.removeDefine('MAKE_ROUND');
};

texture.onChange=function()
{
    if(texture.get())
    {
        if(textureUniform!==null)return;
        shader.removeUniform('diffTex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        textureUniform=new CGL.Uniform(shader,'t','diffTex',0);
    }
    else
    {
        shader.removeUniform('diffTex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        textureUniform=null;
    }
};

textureMask.onChange=function()
{
    if(textureMask.get())
    {
        if(textureMaskUniform!==null)return;
        shader.removeUniform('texMask');
        shader.define('HAS_TEXTURE_MASK');
        textureMaskUniform=new CGL.Uniform(shader,'t','texMask',1);
    }
    else
    {
        shader.removeUniform('texMask');
        shader.removeDefine('HAS_TEXTURE_MASK');
        textureMaskUniform=null;
    }
};

var colorizeTexture=op.addInPort(new CABLES.Port(op,"colorizeTexture",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
colorizeTexture.set(false);
colorizeTexture.onChange=function()
{
    if(colorizeTexture.get()) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};

var textureLookup=op.addInPort(new CABLES.Port(op,"texture Lookup",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
textureLookup.set(false);
textureLookup.onChange=function()
{
    if(textureLookup.get()) shader.define('LOOKUP_TEXTURE');
        else shader.removeDefine('LOOKUP_TEXTURE');
};


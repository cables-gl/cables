
op.name='PointMaterial';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var shaderOut=op.addOutPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));

var pointSize=op.addInPort(new Port(op,"PointSize",OP_PORT_TYPE_VALUE));
var makeRound=op.addInPort(new Port(op,"Round",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var doScale=op.addInPort(new Port(op,"Scale by Distance",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));
var preMultipliedAlpha=op.addInPort(new Port(op,"preMultiplied alpha",OP_PORT_TYPE_VALUE,{ display:'bool' }));




makeRound.set(true);
doScale.set(false);
pointSize.set(3);

var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl,'PointMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.define('MAKE_ROUND');

var uniPointSize=new CGL.Uniform(shader,'f','pointSize',pointSize);


shaderOut.set(shader);
onLoaded=shader.compile;
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
var texture=op.addInPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
var textureUniform=null;

function bindTextures()
{
    if(texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.get().tex);
    }
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

texture.onPreviewChanged=function()
{
    if(texture.showPreview) render.onTriggered=texture.get().preview;
        else render.onTriggered=doRender;

    console.log('show preview!');
};

doScale.onValueChanged=function()
{
    if(doScale.get()) shader.define('SCALE_BY_DISTANCE');
        else shader.removeDefine('SCALE_BY_DISTANCE');
};

makeRound.onValueChanged=function()
{
    if(makeRound.get()) shader.define('MAKE_ROUND');
        else shader.removeDefine('MAKE_ROUND');
};

texture.onValueChanged=function()
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


var colorizeTexture=op.addInPort(new Port(op,"colorizeTexture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
colorizeTexture.set(false);
colorizeTexture.onValueChanged=function()
{
    if(colorizeTexture.get()) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};

var textureLookup=op.addInPort(new Port(op,"texture Lookup",OP_PORT_TYPE_VALUE,{ display:'bool' }));
textureLookup.set(false);
textureLookup.onValueChanged=function()
{
    if(textureLookup.get()) shader.define('LOOKUP_TEXTURE');
        else shader.removeDefine('LOOKUP_TEXTURE');
};


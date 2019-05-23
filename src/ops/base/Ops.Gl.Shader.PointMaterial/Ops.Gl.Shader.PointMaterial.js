const cgl=op.patch.cgl;

const
    render=op.inTrigger("render"),
    pointSize=op.inValueFloat("PointSize",3),
    randomSize=op.inValue("Random Size",3),
    makeRound=op.inValueBool("Round",true),
    doScale=op.inValueBool("Scale by Distance",false),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a",1),
    preMultipliedAlpha=op.inValueBool("preMultiplied alpha"),
    texture=op.inTexture("texture"),
    textureMask=op.inTexture("Texture Mask"),
    colorizeTexture=op.inValueBool("colorizeTexture",false),
    textureLookup=op.inValueBool("texture Lookup",false),
    trigger=op.outTrigger('trigger'),
    shaderOut=op.outObject("shader");

op.setPortGroup("Texture",[textureLookup,textureMask,texture,colorizeTexture]);
op.setPortGroup("Color",[r,g,b,a,preMultipliedAlpha]);
op.setPortGroup("Size",[pointSize,randomSize,makeRound,doScale]);
r.setUiAttribs({ colorPick: true });

const shader=new CGL.Shader(cgl,'PointMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.define('MAKE_ROUND');

const
    uniPointSize=new CGL.Uniform(shader,'f','pointSize',pointSize),
    uniRandomSize=new CGL.Uniform(shader,'f','randomSize',randomSize),
    runiform=new CGL.Uniform(shader,'f','r',r),
    guniform=new CGL.Uniform(shader,'f','g',g),
    buniform=new CGL.Uniform(shader,'f','b',b),
    auniform=new CGL.Uniform(shader,'f','a',a),
    uniWidth=new CGL.Uniform(shader,'f','canvasWidth',cgl.canvasWidth),
    uniHeight=new CGL.Uniform(shader,'f','canvasHeight',cgl.canvasHeight);

shaderOut.set(shader);
shader.setSource(attachments.shader_vert,attachments.shader_frag);
shader.glPrimitive=cgl.gl.POINTS;
shader.bindTextures=bindTextures;
shaderOut.ignoreValueSerialize=true;

render.onTriggered=doRender;

var textureUniform=null;
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
    shader.toggleDefine('SCALE_BY_DISTANCE',doScale.get());
};

makeRound.onChange=function()
{
    shader.toggleDefine('MAKE_ROUND',makeRound.get());
};

colorizeTexture.onChange=function()
{
    shader.toggleDefine('COLORIZE_TEXTURE',colorizeTexture.get());
};

textureLookup.onChange=function()
{
    shader.toggleDefine('LOOKUP_TEXTURE',textureLookup.get());
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


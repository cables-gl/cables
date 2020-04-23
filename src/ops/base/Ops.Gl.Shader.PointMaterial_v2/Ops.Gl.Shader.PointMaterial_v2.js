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
    vertCols=op.inBool("Vertex Colors",false),
    texture=op.inTexture("texture"),
    textureMask=op.inTexture("Texture Mask"),
    textureColorize=op.inTexture("Texture Colorize"),
    colorizeRandom=op.inValueBool("Colorize Randomize",true),
    trigger=op.outTrigger('trigger'),
    shaderOut=op.outObject("shader");

op.setPortGroup("Texture",[texture,textureMask,textureColorize]);
op.setPortGroup("Color",[r,g,b,a,preMultipliedAlpha,vertCols]);
op.setPortGroup("Size",[pointSize,randomSize,makeRound,doScale]);
r.setUiAttribs({ colorPick: true });

const shader=new CGL.Shader(cgl,'PointMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.define('MAKE_ROUND');

const
    uniPointSize=new CGL.Uniform(shader,'f','pointSize',pointSize),
    uniRandomSize=new CGL.Uniform(shader,'f','randomSize',randomSize),
    uniColor=new CGL.Uniform(shader,'4f','color',r,g,b,a),
    uniWidth=new CGL.Uniform(shader,'f','canvasWidth',cgl.canvasWidth),
    uniHeight=new CGL.Uniform(shader,'f','canvasHeight',cgl.canvasHeight),
    textureUniform=new CGL.Uniform(shader,'t','diffTex',0),
    textureColorizeUniform=new CGL.Uniform(shader,'t','texColorize',0),
    textureMaskUniform=new CGL.Uniform(shader,'t','texMask',0);

shader.setSource(attachments.shader_vert,attachments.shader_frag);
shader.glPrimitive=cgl.gl.POINTS;
shaderOut.set(shader);
shaderOut.ignoreValueSerialize=true;

render.onTriggered=doRender;
doScale.onChange=
    makeRound.onChange=
    texture.onChange=
    textureColorize.onChange=
    textureMask.onChange=
    colorizeRandom.onChange=
    textureColorize.onChange=
    vertCols.onChange=updateDefines;


op.preRender=function()
{
    if(shader)shader.bind();
    doRender();
};


function doRender()
{
    uniWidth.setValue(cgl.canvasWidth);
    uniHeight.setValue(cgl.canvasHeight);

    cgl.pushShader(shader);
    shader.popTextures();
    if(texture.get()) shader.pushTexture(textureUniform, texture.get().tex);
    if(textureMask.get()) shader.pushTexture(textureMaskUniform, textureMask.get().tex);
    if(textureColorize.get()) shader.pushTexture(textureColorizeUniform, textureColorize.get().tex);


    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    trigger.trigger();

    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.popShader();
}


function updateDefines()
{
    shader.toggleDefine('SCALE_BY_DISTANCE',doScale.get());
    shader.toggleDefine('MAKE_ROUND',makeRound.get());
    shader.toggleDefine('VERTEX_COLORS',vertCols.get());
    shader.toggleDefine('RANDOM_COLORIZE',colorizeRandom.get());
    shader.toggleDefine('HAS_TEXTURE_DIFFUSE',texture.get());
    shader.toggleDefine('HAS_TEXTURE_MASK',textureMask.get());
    shader.toggleDefine('HAS_TEXTURE_COLORIZE',textureColorize.get());
}


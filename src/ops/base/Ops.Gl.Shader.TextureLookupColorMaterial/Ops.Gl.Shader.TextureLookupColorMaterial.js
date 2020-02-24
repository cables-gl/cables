const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
const shaderOut=op.outObject("shader");
shaderOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;

op.bindTextures=function()
{
    if(op.texture.get()) cgl.setTexture(0,op.texture.get().tex);
    if(op.textureOpacity.get()) cgl.setTexture(1,op.textureOpacity.get().tex);
};

function doRender()
{
    cgl.pushShader(shader);
    shader.bindTextures();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    trigger.trigger();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.popShader();
}

var shader=new CGL.Shader(cgl,'TextureLookupColorMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.bindTextures=op.bindTextures;
shaderOut.set(shader);

shader.setSource(attachments.shader_vert,attachments.shader_frag);


var a=op.inValueSlider("a",1.0);
a.uniform=new CGL.Uniform(shader,'f','a',a);

var posX=op.inValueSlider("pos X",1.0);
posX.uniform=new CGL.Uniform(shader,'f','posX',posX);

var posY=op.inValueSlider("pos Y",1.0);
posY.uniform=new CGL.Uniform(shader,'f','posY',posY);

render.onTriggered=doRender;
op.texture=op.inTexture("texture");
op.textureUniform=null;


op.texture.onChange=function()
{
    if(op.texture.get())
    {
        if(op.textureUniform!==null)return;
        shader.removeUniform('tex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        op.textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
    else
    {
        shader.removeUniform('tex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        op.textureUniform=null;
    }
};

op.textureOpacity=op.inTexture("textureOpacity");
op.textureOpacityUniform=null;

op.textureOpacity.onPreviewChanged=function()
{
    if(op.textureOpacity.showPreview) render.onTriggered=op.textureOpacity.val.preview;
    else render.onTriggered=doRender;

    console.log('show preview!');
};

op.textureOpacity.onChange=function()
{
    if(op.textureOpacity.get())
    {
        if(op.textureOpacityUniform!==null)return;
        console.log('TEXTURE OPACITY ADDED');
        shader.removeUniform('texOpacity');
        shader.define('HAS_TEXTURE_OPACITY');
        op.textureOpacityUniform=new CGL.Uniform(shader,'t','texOpacity',1);
    }
    else
    {
        console.log('TEXTURE OPACITY REMOVED');
        shader.removeUniform('texOpacity');
        shader.removeDefine('HAS_TEXTURE_OPACITY');
        op.textureOpacityUniform=null;
    }
};


op.doBillboard=op.inValueBool("billboard",false);
op.doBillboard.onChange=function()
{
    shader.toggleDefine("BILLBOARD",op.doBillboard.get());
};


var preMultipliedAlpha=op.inValueBool("preMultiplied alpha");

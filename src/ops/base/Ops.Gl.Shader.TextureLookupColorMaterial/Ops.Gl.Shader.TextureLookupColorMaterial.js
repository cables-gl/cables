op.name="TextureLookupColorMaterial";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var shaderOut=op.addOutPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));
shaderOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;

op.bindTextures=function()
{
    if(op.texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, op.texture.val.tex);
    }

    if(op.textureOpacity.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, op.textureOpacity.val.tex);
    }
};

function doRender()
{
    cgl.setShader(shader);
    shader.bindTextures();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    trigger.trigger();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setPreviousShader();
}

var shader=new CGL.Shader(cgl,'TextureLookupColorMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.bindTextures=op.bindTextures;
shaderOut.set(shader);
op.onLoaded=shader.compile;
shader.setSource(attachments.shader_vert,attachments.shader_frag);


var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range'}));
a.uniform=new CGL.Uniform(shader,'f','a',a);
a.set(1.0);

var posX=op.addInPort(new Port(op,"pos X",OP_PORT_TYPE_VALUE,{ display:'range'}));
posX.uniform=new CGL.Uniform(shader,'f','posX',posX);
posX.set(1.0);

var posY=op.addInPort(new Port(op,"pos X",OP_PORT_TYPE_VALUE,{ display:'range'}));
posY.uniform=new CGL.Uniform(shader,'f','posY',posY);
posY.set(1.0);

render.onTriggered=doRender;
op.texture=op.addInPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
op.textureUniform=null;

// op.texture.onPreviewChanged=function()
// {
//     if(op.texture.showPreview) op.render.onTriggered=op.texture.val.preview;
//     else op.render.onTriggered=op.doRender;
//
//     console.log('show preview!');
// };


op.texture.onValueChanged=function()
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

op.textureOpacity=op.addInPort(new Port(op,"textureOpacity",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
op.textureOpacityUniform=null;

op.textureOpacity.onPreviewChanged=function()
{
    if(op.textureOpacity.showPreview) render.onTriggered=op.textureOpacity.val.preview;
    else render.onTriggered=doRender;

    console.log('show preview!');
};

op.textureOpacity.onValueChanged=function()
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

op.colorizeTexture=op.addInPort(new Port(op,"colorizeTexture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.colorizeTexture.val=false;
op.colorizeTexture.onValueChanged=function()
{
    if(op.colorizeTexture.val) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};


op.doBillboard=op.addInPort(new Port(op,"billboard",OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.doBillboard.val=false;
op.doBillboard.onValueChanged=function()
{
    if(op.doBillboard.val)
        shader.define('BILLBOARD');
    else
        shader.removeDefine('BILLBOARD');
};


var diffuseRepeatX=op.addInPort(new Port(op,"diffuseRepeatX",OP_PORT_TYPE_VALUE));
var diffuseRepeatY=op.addInPort(new Port(op,"diffuseRepeatY",OP_PORT_TYPE_VALUE));
diffuseRepeatX.set(1);
diffuseRepeatY.set(1);

diffuseRepeatX.onValueChanged=function()
{
    diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    if(diffuseRepeatY.get()!=1.0 || diffuseRepeatX.get()!=1.0) shader.define('TEXTURE_REPEAT');
        else shader.removeDefine('TEXTURE_REPEAT');
};

diffuseRepeatY.onValueChanged=function()
{
    diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    if(diffuseRepeatY.get()!=1.0 || diffuseRepeatX.get()!=1.0) shader.define('TEXTURE_REPEAT');
        else shader.removeDefine('TEXTURE_REPEAT');
};

var diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX.get());
var diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY.get());

var preMultipliedAlpha=op.addInPort(new Port(op,"preMultiplied alpha",OP_PORT_TYPE_VALUE,{ display:'bool' }));

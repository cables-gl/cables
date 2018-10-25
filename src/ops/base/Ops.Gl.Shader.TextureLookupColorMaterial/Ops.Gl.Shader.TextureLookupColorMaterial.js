const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION) );
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
const shaderOut=op.addOutPort(new CABLES.Port(op,"shader",CABLES.OP_PORT_TYPE_OBJECT));
shaderOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;

op.bindTextures=function()
{
    if(op.texture.get())
        cgl.setTexture(0,op.texture.val.tex);

    if(op.textureOpacity.get())
        cgl.setTexture(1,op.textureOpacity.val.tex);
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
//op.onLoaded=shader.compile;
shader.setSource(attachments.shader_vert,attachments.shader_frag);


var a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
a.uniform=new CGL.Uniform(shader,'f','a',a);
a.set(1.0);

var posX=op.addInPort(new CABLES.Port(op,"pos X",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
posX.uniform=new CGL.Uniform(shader,'f','posX',posX);
posX.set(1.0);

var posY=op.addInPort(new CABLES.Port(op,"pos Y",CABLES.OP_PORT_TYPE_VALUE,{ display:'range'}));
posY.uniform=new CGL.Uniform(shader,'f','posY',posY);
posY.set(1.0);

render.onTriggered=doRender;
op.texture=op.addInPort(new CABLES.Port(op,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
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

op.textureOpacity=op.addInPort(new CABLES.Port(op,"textureOpacity",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
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


op.doBillboard=op.addInPort(new CABLES.Port(op,"billboard",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.doBillboard.val=false;
op.doBillboard.onValueChanged=function()
{
    if(op.doBillboard.val)
        shader.define('BILLBOARD');
    else
        shader.removeDefine('BILLBOARD');
};



var preMultipliedAlpha=op.addInPort(new CABLES.Port(op,"preMultiplied alpha",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

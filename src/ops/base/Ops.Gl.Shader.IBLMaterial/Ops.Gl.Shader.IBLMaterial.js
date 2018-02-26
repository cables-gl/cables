//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance
// https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inCubemap=op.inObject("Cubemap");
var inRough=op.inTexture("Roughness");
var inRoughMul=op.inValueSlider("Roughness Amount",1);
var inReflection=op.inTexture("Reflection");
var inReflMul=op.inValueSlider("Reflection Amount",1);
var inNormal=op.inTexture("Normal");
var inDiffuse=op.inTexture("Diffuse");
var inAo=op.inTexture("AO");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

function doRender()
{
    if(!inCubemap.get() || !inCubemap.get().cubemap)return;
    cgl.setShader(shader);

    if(inCubemap.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);
    }

    if(inRough.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inRough.get().tex);
    }

    if(inReflection.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE2);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inReflection.get().tex);
    }
    
    if(inNormal.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE3);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inNormal.get().tex);
    }

    if(inDiffuse.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inDiffuse.get().tex);
    }

    if(inAo.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE5);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inAo.get().tex);
    }

    trigger.trigger();
    cgl.setPreviousShader();
}

inRough.onChange=updateTexturesDefines;
inReflection.onChange=updateTexturesDefines;
inNormal.onChange=updateTexturesDefines;
inDiffuse.onChange=updateTexturesDefines;
inAo.onChange=updateTexturesDefines;

function updateTexturesDefines()
{
    if(inRough.get()) shader.define("TEX_ROUGHNESS");
        else shader.removeDefine("TEX_ROUGHNESS");

    if(inReflection.get()) shader.define("TEX_REFLECTION");
        else shader.removeDefine("TEX_REFLECTION");

    if(inNormal.get()) shader.define("TEX_NORMAL");
        else shader.removeDefine("TEX_NORMAL");

    if(inDiffuse.get()) shader.define("TEX_DIFFUSE");
        else shader.removeDefine("TEX_DIFFUSE");

    if(inAo.get()) shader.define("TEX_AO");
        else shader.removeDefine("TEX_AO");

}




var shader=new CGL.Shader(cgl,'ibl_material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

op.onLoaded=shader.compile;

shader.setSource(attachments.ibl_vert,attachments.ibl_frag);

// var uniCube=new CGL.Uniform(shader,'t','skybox',0);
var uniRough=new CGL.Uniform(shader,'t','maskRoughness',1);
var uniRefl=new CGL.Uniform(shader,'t','maskReflection',2);
var uniNormal=new CGL.Uniform(shader,'t','texNormal',3);
var uniDiffuse=new CGL.Uniform(shader,'t','texDiffuse',4);
var uniAo=new CGL.Uniform(shader,'t','texAo',5);

var uniMulRefl=new CGL.Uniform(shader,'f','mulReflection',inReflMul);
var uniMulRoug=new CGL.Uniform(shader,'f','mulRoughness',inRoughMul);




render.onTriggered=doRender;


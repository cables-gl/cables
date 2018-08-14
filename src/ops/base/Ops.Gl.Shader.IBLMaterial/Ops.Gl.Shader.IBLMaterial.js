//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance
// https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inCubemap=op.inObject("Cubemap");
var inReflectionCubemap=op.inObject("Reflection Cubemap");
var inFlipY=op.inValueBool("Flip Y");
var inFlipX=op.inValueBool("Flip X");
var inRough=op.inTexture("Roughness");
var inRoughMul=op.inValueSlider("Roughness Amount",0);
var inReflection=op.inTexture("Reflection");
var inReflMul=op.inValueSlider("Reflection Amount",1);
var inNormal=op.inTexture("Normal");
var inDiffuse=op.inTexture("Diffuse");
var inAo=op.inTexture("AO");


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

function doRender()
{
    if(!inCubemap.get() )return;
    cgl.setShader(shader);

    if(inCubemap.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        if(!inCubemap.get().cubemap)
        {
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inCubemap.get().tex);
        }
        else
        {
            cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);
        }
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

    if(inReflectionCubemap.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE6);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inReflectionCubemap.get().cubemap);
    }


    trigger.trigger();
    cgl.setPreviousShader();
}
inCubemap.onChange=updateTexturesDefines;
inRough.onChange=updateTexturesDefines;
inReflection.onChange=updateTexturesDefines;
inNormal.onChange=updateTexturesDefines;
inDiffuse.onChange=updateTexturesDefines;
inAo.onChange=updateTexturesDefines;
inReflectionCubemap.onChange=updateTexturesDefines;
inFlipY.onChange=updateFlip;
inFlipX.onChange=updateFlip;

function updateFlip()
{
    if(inFlipY.get()) shader.define("FLIPY");
        else shader.removeDefine("FLIPY");
    if(inFlipX.get()) shader.define("FLIPX");
        else shader.removeDefine("FLIPX");
    
}

function updateTexturesDefines()
{
    if(inCubemap.get() && !inCubemap.get().cubemap)
    {
        shader.define("TEX_FORMAT_EQUIRECT");
        shader.removeDefine("TEX_FORMAT_CUBEMAP");
    }
    else
    {
        shader.define("TEX_FORMAT_CUBEMAP");
        shader.removeDefine("TEX_FORMAT_EQUIRECT");
    }

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

    if(inReflectionCubemap.get()) shader.define("MAP_REFLECTION");
        else shader.removeDefine("MAP_REFLECTION");
    
    updateFlip();
}





var shader=new CGL.Shader(cgl,'ibl_material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

//op.onLoaded=shader.compile;

shader.setSource(attachments.ibl_vert,attachments.ibl_frag);

var uniCube=new CGL.Uniform(shader,'t','skybox',0);
var uniRough=new CGL.Uniform(shader,'t','maskRoughness',1);
var uniRefl=new CGL.Uniform(shader,'t','maskReflection',2);
var uniNormal=new CGL.Uniform(shader,'t','texNormal',3);
var uniDiffuse=new CGL.Uniform(shader,'t','texDiffuse',4);
var uniAo=new CGL.Uniform(shader,'t','texAo',5);
var uniRefl=new CGL.Uniform(shader,'t','mapReflection',6);

var uniMulRefl=new CGL.Uniform(shader,'f','mulReflection',inReflMul);
var uniMulRoug=new CGL.Uniform(shader,'f','mulRoughness',inRoughMul);




render.onTriggered=doRender;


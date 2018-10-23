//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance
// https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/

const render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const inCubemap=op.inObject("Cubemap");
const inReflectionCubemap=op.inObject("Reflection Cubemap");
const inFlipY=op.inValueBool("Flip Y");
const inFlipX=op.inValueBool("Flip X");
const inRough=op.inTexture("Roughness");
const inRoughMul=op.inValueSlider("Roughness Amount",0);
const inReflection=op.inTexture("Reflection");
const inReflMul=op.inValueSlider("Reflection Amount",1);
const inNormal=op.inTexture("Normal");
const inDiffuse=op.inTexture("Diffuse");
const inAo=op.inTexture("AO");
const inRotation=op.inValueSlider("SampleRotation",0);

const trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
const outShader=op.outObject("Shader");

var cgl=op.patch.cgl;

function doRender()
{
    if(!inCubemap.get() )return;
    cgl.setShader(shader);

    if(inCubemap.get())
    {
        
        if(!inCubemap.get().cubemap)
        {
            /* --- */cgl.setTexture(0,inCubemap.get().tex);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inCubemap.get().tex);
        }
        else
        {
            /* --- */cgl.setTexture(0,inCubemap.get().cubemap,cgl.gl.TEXTURE_CUBE_MAP);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);
        }
    }

    if(inRough.get())
    {
        /* --- */cgl.setTexture(1, inRough.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inRough.get().tex);
    }

    if(inReflection.get())
    {
        /* --- */cgl.setTexture(2, inReflection.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inReflection.get().tex);
    }
    
    if(inNormal.get())
    {
        /* --- */cgl.setTexture(3, inNormal.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inNormal.get().tex);
    }

    if(inDiffuse.get())
    {
        /* --- */cgl.setTexture(4, inDiffuse.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inDiffuse.get().tex);
    }

    if(inAo.get())
    {
        /* --- */cgl.setTexture(5, inAo.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inAo.get().tex);
    }

    if(inReflectionCubemap.get())
    {
        if(!inReflectionCubemap.get().cubemap) cgl.setTexture(6,inReflectionCubemap.get().tex);
            else cgl.setTexture(6, inReflectionCubemap.get().cubemap , cgl.gl.TEXTURE_CUBE_MAP);
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
var uniRotOff=new CGL.Uniform(shader,'f','fRotation',inRotation);
var uniMulRefl=new CGL.Uniform(shader,'f','mulReflection',inReflMul);
var uniMulRoug=new CGL.Uniform(shader,'f','mulRoughness',inRoughMul);


outShader.set(shader);

render.onTriggered=doRender;


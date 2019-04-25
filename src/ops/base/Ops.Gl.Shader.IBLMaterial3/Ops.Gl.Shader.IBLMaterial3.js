//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance
//https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/

const render=op.inTrigger("render");
const inLightmap=op.inObject("Lightmap");
const inDiffuse=op.inTexture("Diffuse");

const
    inReflectionCubemap=op.inObject("Reflection Cubemap"),
    inReflMul=op.inValueSlider("Reflection Amount",0.3),
    inReflection=op.inTexture("Reflection Mask"),
    inRotation=op.inValueSlider("SampleRotation",0);
op.setPortGroup("Reflection",[inReflectionCubemap,inReflMul,inRotation,inReflection]);

const
    inRoughMul=op.inValueSlider("Roughness",0),
    inRough=op.inTexture("Roughness Map");
op.setPortGroup("Roughness",[inRoughMul,inRough]);

const
    inNormalScreen=op.inValueBool("Screenspace Normals",false),
    inNormal=op.inTexture("Normal Map"),
    inNormalIntensity=op.inValueSlider("Normal Intensity",1),
    inNormalFlip=op.inValueBool("Normal Flip",false);
op.setPortGroup("Normals",[inNormalScreen,inNormal,inNormalIntensity,inNormalFlip]);

const
    inAo=op.inTexture("AO"),
    inAoIntensity=op.inValueSlider("AO Intensity",1);
op.setPortGroup("AO Map",[inAo,inAoIntensity]);

const
    inOpacityMap=op.inTexture("Opacity Map"),
    inOpacitySrc=op.inValueSelect("Opacity Source Channel",["Red Channel","Alpha Channel","Luminance"],"Red Channel"),
    inOpacity=op.inValueSlider("Opacity",1);

const
    inFresnel=op.inValueBool("Fresnel"),
    inFresnelAmount=op.inValueSlider("Amount",1.0),
    inFresnelWidth=op.inValue("Width",1.0),
    inFresnelExponent=op.inValue("Exponent",5.0),
    fresnelR = op.inValueSlider("r", Math.random()),
    fresnelG = op.inValueSlider("g", Math.random()),
    fresnelB = op.inValueSlider("b", Math.random());
fresnelR.setUiAttribs({ colorPick: true });
op.setPortGroup("Fresnel",[inFresnelAmount,inFresnel,inFresnelWidth,inFresnelExponent,fresnelR,fresnelG,fresnelB]);

const
    inRepeatX=op.inValue("Repeat X",1),
    inRepeatY=op.inValue("Repeat Y",1),
    inOffsetX=op.inValue("Offset X",0),
    inOffsetY=op.inValue("Offset Y",0),
    inTransfOpacity=op.inValueBool("Transform Opacity",true);
op.setPortGroup("Texture Transform",[inRepeatX,inRepeatY,inOffsetX,inOffsetY]);

const trigger=op.outTrigger("trigger");
const outShader=op.outObject("Shader");

const cgl=op.patch.cgl;

inNormalScreen.onChange=
    inNormalFlip.onChange=
    inLightmap.onChange=
    inRough.onChange=
    inReflection.onChange=
    inOpacityMap.onChange=
    inNormal.onChange=
    inDiffuse.onChange=
    inAo.onChange=
    inTransfOpacity.onChange=
    inOpacitySrc.onChange=
    inReflectionCubemap.onChange=updateTexturesDefines;


const shader=new CGL.Shader(cgl,"ibl material 3");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

if(cgl.glVersion==1 && !cgl.gl.getExtension('EXT_shader_texture_lod'))
    throw "no EXT_shader_texture_lod texture extension";

if(cgl.glVersion==1) shader.enableExtension('GL_EXT_shader_texture_lod');

shader.setSource(attachments.ibl_vert,attachments.ibl_frag);
shader.bindTextures=bindTextures;

const
    uniCube=new CGL.Uniform(shader,'t','irradiance',0),
    uniRough=new CGL.Uniform(shader,'t','maskRoughness',7),
    uniRefl=new CGL.Uniform(shader,'t','maskReflection',2),
    uniNormal=new CGL.Uniform(shader,'t','texNormal',3),
    uniDiffuse=new CGL.Uniform(shader,'t','texDiffuse',4),
    uniAo=new CGL.Uniform(shader,'t','texAo',5),
    uniOpacityTex=new CGL.Uniform(shader,'t','texOpacity',6),
    uniReflMap=new CGL.Uniform(shader,'t','mapReflection',1),
    uniRotOff=new CGL.Uniform(shader,'f','fRotation',inRotation),
    uniMulRefl=new CGL.Uniform(shader,'f','mulReflection',inReflMul),
    uniMulRoug=new CGL.Uniform(shader,'f','mulRoughness',inRoughMul),
    uniAoAmount=new CGL.Uniform(shader,'f','aoIntensity',inAoIntensity),
    uniNormalIntensity=new CGL.Uniform(shader,'f','normalIntensity',inNormalIntensity),
    uniRepeatX=new CGL.Uniform(shader,'f','repeatX',inRepeatX),
    uniRepeatY=new CGL.Uniform(shader,'f','repeatY',inRepeatY),
    uniOffsetX=new CGL.Uniform(shader,'f','offsetX',inOffsetX),
    uniOffsetY=new CGL.Uniform(shader,'f','offsetY',inOffsetY),
    uniOpacity=new CGL.Uniform(shader,'f','opacity',inOpacity),
    uniFesnelWidth=new CGL.Uniform(shader,'f','fresnelWidth',inFresnelWidth),
    uniFesnelAmount=new CGL.Uniform(shader,'f','fresnelAmount',inFresnelAmount),
    uniFesnelR=new CGL.Uniform(shader,'f','fresnelR',fresnelR),
    uniFesnelG=new CGL.Uniform(shader,'f','fresnelG',fresnelG),
    uniFesnelB=new CGL.Uniform(shader,'f','fresnelB',fresnelB),
    uniFresnelExponent=new CGL.Uniform(shader,'f','fresnelExponent',inFresnelExponent);


outShader.set(shader);
render.onTriggered=doRender;
var hasError=false;

inFresnel.onChange=function()
{
    if(inFresnel.get())
    {
        shader.define("ENABLE_FRESNEL");
        inFresnelWidth.setUiAttribs({greyout:false});
        inFresnelExponent.setUiAttribs({greyout:false});
        inFresnelAmount.setUiAttribs({greyout:false});
        fresnelR.setUiAttribs({greyout:false});
        fresnelG.setUiAttribs({greyout:false});
        fresnelB.setUiAttribs({greyout:false});
    }
    else
    {
        shader.removeDefine("ENABLE_FRESNEL");
        inFresnelWidth.setUiAttribs({greyout:true});
        inFresnelExponent.setUiAttribs({greyout:true});
        inFresnelAmount.setUiAttribs({greyout:true});
        fresnelR.setUiAttribs({greyout:true});
        fresnelG.setUiAttribs({greyout:true});
        fresnelB.setUiAttribs({greyout:true});
    }
};

function checkMipmap()
{
    hasError=false;

    if(inReflectionCubemap.get() && inReflectionCubemap.get().filter!=CGL.Texture.FILTER_MIPMAP )
    {
        hasError=true;
        op.uiAttr({'error':'reflection map should be mipmap!'});
    }

    if(!hasError && op.uiAttribs.error)
    {
        op.uiAttr({'error':null});
        return true;
    }
}

function bindTextures()
{
    if(inLightmap.get())
    {
        if(!inLightmap.get().cubemap) cgl.setTexture(0,inLightmap.get().tex);
            else cgl.setTexture(0,CGL.Texture.inLightmap(cgl).cubemap,cgl.gl.TEXTURE_CUBE_MAP);
    }
    else cgl.setTexture(0,CGL.Texture.getTempGradientTexture(cgl).tex);

    if(inReflection.get()) cgl.setTexture(2,inReflection.get().tex);
    if(inNormal.get()) cgl.setTexture(3,inNormal.get().tex);
    if(inDiffuse.get()) cgl.setTexture(4,inDiffuse.get().tex);
    if(inAo.get()) cgl.setTexture(5,inAo.get().tex);
    if(inOpacityMap.get()) cgl.setTexture(6,inOpacityMap.get().tex);
    if(inRough.get()) cgl.setTexture(7,inRough.get().tex);

    if(inReflectionCubemap.get())
    {
        if(!inReflectionCubemap.get().cubemap) cgl.setTexture(1, inReflectionCubemap.get().tex);
            else cgl.setTexture(1, inReflectionCubemap.get().cubemap);
    }
    else cgl.setTexture(1, CGL.Texture.getTempTexture(cgl).tex);

}

function updateTexturesDefines()
{
    checkMipmap();

    shader.define("TEX_FORMAT_EQUIRECT");
    shader.removeDefine("TEX_FORMAT_CUBEMAP");

    if(inLightmap.get() && inLightmap.get().cubemap)
    {
        shader.define("TEX_FORMAT_CUBEMAP");
        shader.removeDefine("TEX_FORMAT_EQUIRECT");
    }

    shader.toggleDefine("CALC_SSNORMALS",inNormalScreen.get());
    shader.toggleDefine("TEX_ROUGHNESS",inRough.get());
    shader.toggleDefine("TEX_REFLECTION",inReflection.get());
    shader.toggleDefine("TEX_NORMAL",inNormal.get());
    shader.toggleDefine("TEX_NORMAL_FLIP",inNormalFlip.get());
    shader.toggleDefine("TEX_DIFFUSE",inDiffuse.get());
    shader.toggleDefine("TEX_AO",inAo.get());
    shader.toggleDefine("TEX_OPACITY",inOpacityMap.get());
    shader.toggleDefine("MAP_REFLECTION",inReflectionCubemap.get());
    shader.toggleDefine("TRANSFORM_OPACITY",inTransfOpacity.get());

    shader.toggleDefine("ORIG_TEXCOORD",!inTransfOpacity.get() || inAo.get() );

    shader.toggleDefine("TEX_OPACITY_SRC_R",inOpacitySrc.get()=="Red Channel");
    shader.toggleDefine("TEX_OPACITY_SRC_A",inOpacitySrc.get()=="Alpha Channel");
    shader.toggleDefine("TEX_OPACITY_SRC_LUMI",inOpacitySrc.get()=="Luminance");

}

function doRender()
{
    cgl.setShader(shader);
    bindTextures();
    trigger.trigger();
    cgl.setPreviousShader();
}


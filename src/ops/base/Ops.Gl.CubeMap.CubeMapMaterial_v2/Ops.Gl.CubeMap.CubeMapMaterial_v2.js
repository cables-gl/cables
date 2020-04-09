//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance

const render=op.inTrigger('render');
const inMiplevel=op.inValueSlider("Mip Level",0.0);
const inRotation = op.inFloatSlider("Rotation", 0);
const inCubemap=op.inObject("Cubemap");

const mapReflect=op.inValueBool("Reflection",true);
const invertReflection = op.inValueBool("Invert", false);
mapReflect.onChange=updateMapping;
inCubemap.onChange=updateMapping;
invertReflection.onChange = function() {
    shader.toggleDefine("INVERT_REFLECTION", invertReflection.get());
}

const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;

function doRender()
{
    cgl.pushShader(shader);

    if(inCubemap.get())
    {
        if(inCubemap.get().cubemap) cgl.setTexture(0,inCubemap.get().cubemap,cgl.gl.TEXTURE_CUBE_MAP);
        else cgl.setTexture(0,inCubemap.get().tex);
    }
    else cgl.setTexture(0,CGL.Texture.getTempTexture(cgl).tex);

    trigger.trigger();
    cgl.popShader();
}

function updateMapping()
{
    if(mapReflect.get())shader.define("DO_REFLECTION");
        else shader.removeDefine("DO_REFLECTION");

    if(inCubemap.get() && inCubemap.get().cubemap)
    {
        shader.define("TEX_FORMAT_CUBEMAP");
        shader.removeDefine("TEX_FORMAT_EQUIRECT");
    }
    else
    {
        shader.removeDefine("TEX_FORMAT_CUBEMAP");
        shader.define("TEX_FORMAT_EQUIRECT");
    }
}

const srcVert=attachments.cubemap_vert;
const srcFrag=attachments.cubemap_frag;


const shader=new CGL.Shader(cgl,'cubemap material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);



shader.setSource(srcVert,srcFrag);
inMiplevel.uniform=new CGL.Uniform(shader,'f','miplevel', inMiplevel);
const inRotationUniform = new CGL.Uniform(shader, 'f', 'inRotation', inRotation);
render.onTriggered=doRender;
updateMapping();

//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance

var render=op.inTrigger('render');
var inMiplevel=op.inValueSlider("Mip Level",0.0);
var inCubemap=op.inObject("Cubemap");

var mapReflect=op.inValueBool("Reflection",true);
mapReflect.onChange=updateMapping;
inCubemap.onChange=updateMapping;

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;

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

var srcVert=attachments.cubemap_vert;
var srcFrag=attachments.cubemap_frag;


var shader=new CGL.Shader(cgl,'cube map material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);



shader.setSource(srcVert,srcFrag);
inMiplevel.uniform=new CGL.Uniform(shader,'f','miplevel',inMiplevel);

render.onTriggered=doRender;
updateMapping();

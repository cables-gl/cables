//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html

op.name='CubeMapMaterial';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inCubemap=op.inObject("Cubemap");

var mapReflect=op.inValueBool("Reflection",true);
mapReflect.onChange=updateMapping;

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


    trigger.trigger();
    cgl.setPreviousShader();
}

function updateMapping()
{
    if(mapReflect.get())shader.define("DO_REFLECTION");
        else shader.removeDefine("DO_REFLECTION");
}




var srcVert=attachments.cubemap_vert;
var srcFrag=attachments.cubemap_frag;


var shader=new CGL.Shader(cgl);
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

op.onLoaded=shader.compile;

shader.setSource(srcVert,srcFrag);

render.onTriggered=doRender;
updateMapping();

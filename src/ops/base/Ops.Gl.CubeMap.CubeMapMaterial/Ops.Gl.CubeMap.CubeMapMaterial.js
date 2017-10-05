
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




var srcVert=''
    // .endl()+'uniform mat4 projection;'
    .endl()+'{{MODULES_HEAD}}'
    .endl()+'precision highp float;'
    .endl()+'UNI mat4 projMatrix;'
    .endl()+'UNI mat4 modelMatrix;'
    .endl()+'UNI mat4 viewMatrix;'
    // .endl()+'uniform mat4 normalMatrix;'


    // .endl()+'IN vec3 a_coords;'
    // .endl()+'IN vec3 a_normal;'
    .endl()+'OUT vec3 v_eyeCoords;'
    .endl()+'OUT vec3 v_normal;'
    .endl()+'OUT vec3 v_pos;'

    .endl()+'IN vec3 vPosition;'


    // .endl()+'IN vec2 attrTexCoord;'
    .endl()+'IN vec3 attrVertNormal;'

    .endl()+'void main() {'

    .endl()+'    mat4 modelview= viewMatrix * modelMatrix;'

    .endl()+'    v_pos= vPosition;'
    .endl()+'    vec4 pos = vec4( vPosition, 1. );'

    .endl()+'{{MODULE_VERTEX_POSITION}}'

    .endl()+'   vec4 eyeCoords = modelview * pos;'
    
    
    
    .endl()+'   gl_Position = projMatrix * eyeCoords;'
    .endl()+'   v_eyeCoords = eyeCoords.xyz;'
    .endl()+'   v_normal = normalize(attrVertNormal);'
    .endl()+'}';


var srcFrag=''
.endl()+'precision highp float;'
    .endl()+'{{MODULES_HEAD}}'
    .endl()+'IN vec3 vCoords;'
    .endl()+'IN vec3 v_normal;'
    .endl()+'IN vec3 v_eyeCoords;'
    .endl()+'IN vec3 v_pos;'
    .endl()+'UNI samplerCube skybox;'
    .endl()+'UNI mat4 normalMatrix;'
    .endl()+'UNI mat4 inverseViewMatrix;'
    .endl()+'UNI mat4 modelMatrix;'

    .endl()+'void main() {'
    .endl()+'{{MODULE_BEGIN_FRAG}}'
    
    .endl()+'    vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;'
    .endl()+'    vec3 V = -v_eyeCoords;'
    .endl()+'    vec3 R = -reflect(V,N);'
    .endl()+'    vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz;' // Transform by inverse of the view transform that was applied to the skybox

    .endl()+'vec4 col = vec4(1.0,1.0,1.0,1.0);'

    .endl()+'#ifdef DO_REFLECTION'
    .endl()+'    col = texture(skybox, T);'
    .endl()+'#endif'
    .endl()+'#ifndef DO_REFLECTION'
    .endl()+'    col = texture(skybox, v_pos);'
    .endl()+'#endif'
    
    .endl()+'{{MODULE_COLOR}};'
    
    .endl()+'outColor=col;'
    


    .endl()+'}';


var shader=new CGL.Shader(cgl);
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

op.onLoaded=shader.compile;

shader.setSource(srcVert,srcFrag);

render.onTriggered=doRender;
updateMapping();

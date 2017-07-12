
op.name='CubeMapMaterial';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var inCubemap=op.inObject("Cubemap");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    
    
    if(inCubemap.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);

    }

    
    trigger.trigger();
    cgl.setPreviousShader();
}

var srcVert=''
    // .endl()+'uniform mat4 projection;'
    // .endl()+'uniform mat4 modelview;'
    
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 modelMatrix;'
    .endl()+'uniform mat4 viewMatrix;'
    // .endl()+'uniform mat4 normalMatrix;'

    
    // .endl()+'attribute vec3 a_coords;'
    // .endl()+'attribute vec3 a_normal;'
    .endl()+'varying vec3 v_eyeCoords;'
    .endl()+'varying vec3 v_normal;'

    .endl()+'attribute vec3 vPosition;'
    // .endl()+'attribute vec2 attrTexCoord;'
    .endl()+'attribute vec3 attrVertNormal;'

    .endl()+'void main() {'
    
    .endl()+'    mat4 modelview= viewMatrix * modelMatrix;'


    .endl()+'   vec4 eyeCoords = modelview * vec4(vPosition,1.0);'
    .endl()+'   gl_Position = projMatrix * eyeCoords;'
    .endl()+'   v_eyeCoords = eyeCoords.xyz;'
    .endl()+'   v_normal = normalize(attrVertNormal);'
    .endl()+'}';


var srcFrag=''
    // .endl()+'precision mediump float;'
    .endl()+'varying vec3 vCoords;'
    .endl()+'varying vec3 v_normal;'
    .endl()+'varying vec3 v_eyeCoords;'
    .endl()+'uniform samplerCube skybox;'
    .endl()+'uniform mat4 normalMatrix;'
    .endl()+'uniform mat4 inverseViewMatrix;'
    .endl()+'uniform mat4 modelMatrix;'

    .endl()+'void main() {'
    .endl()+'    vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;'
    .endl()+'    vec3 V = -v_eyeCoords;'
    .endl()+'    vec3 R = -reflect(V,N);'
    .endl()+'    vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz;' // Transform by inverse of the view transform that was applied to the skybox
    .endl()+'    gl_FragColor = textureCube(skybox, T);'
    .endl()+'}';


var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

shader.setSource(srcVert,srcFrag);

render.onTriggered=doRender;
doRender();
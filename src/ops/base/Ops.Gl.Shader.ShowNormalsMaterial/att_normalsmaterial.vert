IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal,attrTangent,attrBiTangent;
OUT vec2 texCoord;
OUT vec3 normal;
OUT vec3 outTangent,outBiTangent;
OUT mat4 mMatrix;
UNI mat4 projMatrix;
// UNI mat4 mvMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;


{{MODULES_HEAD}}

void main()
{
    texCoord=attrTexCoord;
    vec3 norm=attrVertNormal;
    vec3 tangent=attrTangent;
    vec3 bitangent=attrBiTangent;

    vec4 pos=vec4(vPosition,1.0);
    mMatrix=modelMatrix;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix*mMatrix;

    normal=norm;
    outTangent=tangent;
    outBiTangent=bitangent;

    gl_Position = projMatrix * mvMatrix * pos;
}
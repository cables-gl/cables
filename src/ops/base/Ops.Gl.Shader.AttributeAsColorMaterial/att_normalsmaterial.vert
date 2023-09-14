IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec2 attrTexCoord1;
IN float attrVertIndex;
IN vec3 attrVertNormal,attrTangent,attrBiTangent;
OUT vec2 texCoord;
OUT vec2 texCoord1;
OUT vec3 normal;
OUT vec3 tangent;
OUT vec3 bitangent;
OUT vec3 outTangent,outBiTangent;
OUT mat4 mMatrix;
OUT vec3 vert;
OUT mat4 mvMatrix;
UNI mat4 projMatrix;

// UNI mat4 mvMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;


{{MODULES_HEAD}}

void main()
{
    texCoord=attrTexCoord;
    texCoord1=attrTexCoord1;
    vec3 norm=attrVertNormal;
    tangent=attrTangent;
    bitangent=attrBiTangent;

    vec4 pos=vec4(vPosition,1.0);
    mMatrix=modelMatrix;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix*mMatrix;

    vert=pos.xyz;
    normal=norm;
    outTangent=tangent;
    outBiTangent=bitangent;

    gl_Position = projMatrix * mvMatrix * pos;
}
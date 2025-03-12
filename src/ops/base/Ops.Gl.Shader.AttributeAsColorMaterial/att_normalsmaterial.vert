IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec2 attrTexCoord1;
IN float attrVertIndex;
IN vec3 attrVertNormal,attrTangent,attrBiTangent;
OUT vec2 texCoord;
OUT vec2 texCoord1;
OUT vec3 outNormal;
OUT vec3 tangent;
OUT vec3 bitangent;
OUT vec3 outTangent,outBiTangent;
OUT vec4 outPosition;
OUT mat4 mMatrix;
OUT vec3 vert;
OUT mat4 mvMatrix;
UNI mat4 projMatrix;

UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI mat4 normalMatrix;


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

    mat4 modelViewMatrix=viewMatrix*mMatrix;

    vert=pos.xyz;

    #ifdef SHOW_NORMAL_MAT
        norm=( vec4(norm,1.0)*normalMatrix ).xyz;
    #endif
    outNormal=norm;
    outTangent=tangent;
    outBiTangent=bitangent;
    outPosition= mMatrix * pos;

    {{MODULE_VERTEX_MODELVIEW}}

    gl_Position = projMatrix*viewMatrix*outPosition;
}

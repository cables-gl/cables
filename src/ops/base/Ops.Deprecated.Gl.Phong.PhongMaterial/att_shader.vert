
{{MODULES_HEAD}}

IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;

// IN vec3 attrTangent;
// IN vec3 attrBiTangent;
OUT vec3 vTangent;
OUT vec3 vBiTangent;


OUT mediump vec3 norm;
OUT mediump vec3 vert;
OUT mat4 mvMatrix;
UNI mat4 normalMatrix;

#ifdef HAS_TEXTURES
    OUT mediump vec2 texCoord;
#endif

void main()
{
    norm=attrVertNormal;
    vert=vPosition;
    mat4 mMatrix=modelMatrix;

    // vTangent=attrTangent;
    // vBiTangent=attrBiTangent;

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    vec4 pos = vec4( vPosition, 1. );
    mvMatrix=viewMatrix * mMatrix;
    {{MODULE_VERTEX_POSITION}}

    gl_Position = projMatrix * mvMatrix * pos;
}

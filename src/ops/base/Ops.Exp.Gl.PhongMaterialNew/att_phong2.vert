
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
// UNI mat4 normalMatrix;

OUT vec3 vViewPosition;
OUT vec3 vNormal;


#ifdef HAS_TEXTURES
    OUT  vec2 texCoord;
#endif

OUT mat3 normalMatrix;
OUT vec4 modelPos;

void main()
{
    norm=attrVertNormal;
    vert=vPosition;

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    vec4 pos = vec4( vPosition, 1. );
    modelPos=modelMatrix*pos;
    mvMatrix=viewMatrix*modelMatrix;

    {{MODULE_VERTEX_POSITION}}

    vec4 viewModelPosition = mvMatrix * pos;
    vViewPosition = viewModelPosition.xyz;

    gl_Position = projMatrix * mvMatrix * pos;
}


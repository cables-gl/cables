precision highp float;
precision highp int;
IN vec3  vPosition;

IN vec2  attrTexCoord;
IN vec3  attrVertNormal;
IN vec3  attrTangent;
IN vec3  attrBiTangent;
IN float attrVertIndex;
#ifdef VERTEX_COLORS
IN vec4 attrVertColor;
#endif

{{MODULES_HEAD}}

OUT vec2 texCoord;
OUT vec4 FragPos;
OUT mat3 TBN;
OUT vec3 norm;
OUT vec3 normM;
#ifdef VERTEX_COLORS
OUT vec4 vCol0;
#endif

UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;

void main()
{
    mat4 mMatrix = modelMatrix; // needed to make vertex effects work

    texCoord = attrTexCoord;
    texCoord.y = 1.0 - texCoord.y;
    vec4 pos = vec4(vPosition,  1.0);
    norm = attrVertNormal;
    vec3 tangent = attrTangent;
    vec3 bitangent = attrBiTangent;
    
    {{MODULE_VERTEX_POSITION}}
    
    #ifndef INSTANCING
    FragPos = mMatrix * pos;
    #else
    FragPos = instModelMat * pos;
    #endif

    #ifndef INSTANCING
    tangent = normalize(vec3(mMatrix * vec4(tangent,    0.0)));
    vec3 N = normalize(vec3(mMatrix * vec4(norm, 0.0)));
    #else
    tangent = normalize(vec3(instMat * vec4(tangent,    0.0)));
    vec3 N = normalize(vec3(instMat * vec4(norm, 0.0)));
    #endif

    #ifndef DONT_USE_GS
    tangent      = normalize(tangent - dot(tangent, N) * N);
    bitangent = cross(N, tangent);
    #else
    #ifndef INSTANCING
    bitangent = normalize(vec3(mMatrix * vec4(bitangent,  0.0)));
    #else
    bitangent = normalize(vec3(instMat * vec4(bitangent,  0.0)));
    #endif
    #endif

    #ifdef VERTEX_COLORS
    vCol0 = attrVertColor;
    #endif

    TBN = mat3(tangent, bitangent, N);
    normM = N;

    gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;
}

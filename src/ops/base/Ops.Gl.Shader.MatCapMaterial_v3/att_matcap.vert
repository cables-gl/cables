IN vec3 vPosition;

#ifdef HAS_TEXTURES
    IN vec2 attrTexCoord;
#endif

IN vec3 attrVertNormal;
IN float attrVertIndex;

#ifdef HAS_NORMAL_TEXTURE
    IN vec3 attrTangent;
    IN vec3 attrBiTangent;
    OUT vec3 vBiTangent;
    OUT vec3 vTangent;
#endif

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI vec3 camPos;

#ifdef HAS_TEXTURES
    UNI vec2 texOffset;
    UNI vec2 texRepeat;
    OUT vec2 texCoord;
#endif

OUT mat3 normalMatrix;
OUT vec3 viewSpacePosition;
OUT vec3 transformedNormal;

{{MODULES_HEAD}}

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    OUT vec3 eye_relative_pos;
#endif

mat3 transposeMat3(mat3 m) {
    return mat3(m[0][0], m[1][0], m[2][0],
        m[0][1], m[1][1], m[2][1],
        m[0][2], m[1][2], m[2][2]);
}

 mat3 inverseMat3(mat3 m) {
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 = a22 * a11 - a12 * a21;
    float b11 = -a22 * a10 + a12 * a20;
    float b21 = a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
        b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
        b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}

void main()
{
    #ifdef HAS_TEXTURES
        texCoord = texRepeat * vec2(attrTexCoord.x, attrTexCoord.y) + texOffset;
        texCoord.y = 1. - texCoord.y;
    #endif

    mat4 mMatrix = modelMatrix;
    mat4 mvMatrix;

    #ifdef HAS_NORMAL_TEXTURE
        vec3 tangent = attrTangent;
        vec3 bitangent = attrBiTangent;
        vTangent = attrTangent;
        vBiTangent = attrBiTangent;
    #endif

    vec4 pos = vec4(vPosition, 1.);
    vec3 norm = attrVertNormal;

    {{MODULE_VERTEX_POSITION}}

    mvMatrix = viewMatrix * mMatrix;
    vec3 normal = norm;

    normalMatrix = transposeMat3(inverseMat3(mat3(mvMatrix)));

    vec3 fragPos = vec3((mvMatrix) * pos);
    viewSpacePosition = normalize(fragPos);

    #ifdef CALC_SSNORMALS
        eye_relative_pos = -(vec3(viewMatrix * vec4(camPos, 1.)) - fragPos);
    #endif

    transformedNormal = normalize(mat3(normalMatrix) * normal);

    mat4 modelViewMatrix=mvMatrix;
    {{MODULE_VERTEX_MODELVIEW}}

    gl_Position = projMatrix * modelViewMatrix * pos;

}

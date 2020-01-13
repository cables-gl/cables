IN vec3 vPosition;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;

IN vec3 attrTangent;
IN vec3 attrBiTangent;
IN float attrVertIndex;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI mat4 lightMatrix;
UNI mat4 lightMatrices[NUM_LIGHTS];
OUT vec3 norm;
OUT mat4 mvMatrix;
OUT mat3 normalMatrix;
OUT vec4 modelPos;
OUT vec2 texCoord;
OUT vec4 shadowCoord;
OUT vec4 shadowCoords[NUM_LIGHTS];
{{MODULES_HEAD}}

mat3 transposeMat3(mat3 m)
{
    return mat3(m[0][0], m[1][0], m[2][0],
        m[0][1], m[1][1], m[2][1],
        m[0][2], m[1][2], m[2][2]);
}

mat3 inverseMat3(mat3 m)
{
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
    vec4 pos = vec4( vPosition, 1. );
    mat4 mMatrix=modelMatrix;
    vec3 tangent=attrTangent,
        bitangent=attrBiTangent;

    texCoord=attrTexCoord;

    norm=attrVertNormal;

    normalMatrix = transposeMat3(inverseMat3(mat3(mMatrix)));

    {{MODULE_VERTEX_POSITION}}

    // this needs only to be done when instancing....

    mvMatrix=viewMatrix*mMatrix;
    modelPos=mMatrix*pos;
    #ifdef SHADOW_MAP
        for (int i = 0; i < NUM_LIGHTS; i++) {
            shadowCoords[i] = lightMatrices[i] * modelPos;
        }
    #endif

    gl_Position = projMatrix * mvMatrix * pos;
    // shadowCoord = lightMatrix * modelPos; // vec4(fragPos, 1.);
    // gl_Position = shadowCoord;
}

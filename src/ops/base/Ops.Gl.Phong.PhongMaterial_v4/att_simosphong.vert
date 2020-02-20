
{{MODULES_HEAD}}

#define NONE -1
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2
#define SPOT 3

#define TEX_REPEAT_X x;
#define TEX_REPEAT_Y y;
#define TEX_OFFSET_X z;
#define TEX_OFFSET_Y w;

IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;
IN vec3 attrTangent;
IN vec3 attrBiTangent;

OUT vec2 texCoord;
OUT vec3 norm;
OUT vec3 normInterpolated;
OUT vec3 tangent;
OUT vec3 bitangent;
OUT vec3 fragPos;


OUT mat3 TBN_Matrix; // tangent bitangent normal space transform matrix
OUT vec4 cameraSpace_pos;
OUT vec3 v_viewDirection;

#ifdef HAS_TEXTURES
    UNI vec4 inTextureRepeatOffset;
#endif

struct Light {
    vec3 position;
    int type;
};

UNI vec3 camPos;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;
OUT mat3 normalMatrix;
// UNI mat4 normalMatrix;


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
    mat4 mMatrix=modelMatrix;
    vec4 pos=vec4(vPosition,  1.0);
    mat4 mvMatrix;
    texCoord=attrTexCoord;
    norm=attrVertNormal;

    tangent = attrTangent;
    bitangent = attrBiTangent;

    {{MODULE_VERTEX_POSITION}}

    normalMatrix = transposeMat3(inverseMat3(mat3(mMatrix)));
    mvMatrix = (viewMatrix * mMatrix);



    cameraSpace_pos = mvMatrix * pos;

    #ifdef HAS_TEXTURES
        float repeatX = inTextureRepeatOffset.TEX_REPEAT_X;
        float offsetX = inTextureRepeatOffset.TEX_OFFSET_X;
        float repeatY = inTextureRepeatOffset.TEX_REPEAT_Y;
        float offsetY = inTextureRepeatOffset.TEX_OFFSET_Y;

        texCoord.x *= repeatX;
        texCoord.x += offsetX;
        texCoord.y *= repeatY;
        texCoord.y += offsetY;
    #endif

   normInterpolated = vec3(normalMatrix*norm);

        vec3 normCameraSpace = normalize((vec4(normInterpolated, 0.0)).xyz);
        vec3 tangCameraSpace = normalize((mMatrix * vec4(attrTangent, 0.0)).xyz);
        vec3 bitangCameraSpace = normalize((mMatrix * vec4(attrBiTangent, 0.0)).xyz);

        // re orthogonalization for smoother normals
        tangCameraSpace = normalize(tangCameraSpace - dot(tangCameraSpace, normCameraSpace) * normCameraSpace);
        bitangCameraSpace = cross(normCameraSpace, tangCameraSpace);

        TBN_Matrix = mat3(tangCameraSpace, bitangCameraSpace, normCameraSpace);


    fragPos = vec3((mMatrix) * pos);
    v_viewDirection = normalize(camPos - fragPos);

    gl_Position = projMatrix * mvMatrix * pos;
}
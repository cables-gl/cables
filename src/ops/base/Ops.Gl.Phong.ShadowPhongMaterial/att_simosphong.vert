
{{MODULES_HEAD}}

#define TEX_REPEAT_X x;
#define TEX_REPEAT_Y y;
#define TEX_OFFSET_X z;
#define TEX_OFFSET_Y w;

#define NONE -1
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2
#define SPOT 3

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


#ifdef RECEIVE_SHADOW
    OUT vec4 lightSpace_fragPos[MAX_SHADOWMAPS];
    OUT vec4 shadowCoords[MAX_SHADOWMAPS];
#endif


struct Light {
    int type;
    mat4 mvpBiasMatrix;
    int shadowMapIndex;
};

struct LightTest {
    int type;
    mat4 mvpBiasMatrix;
    int shadowMapIndex;
};

#ifdef HAS_TEXTURES
    UNI vec4 inTextureRepeatOffset;
#endif

UNI vec3 camPos;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;
UNI mat4 normalMatrix;
UNI Light vertexLights[MAX_LIGHTS];
// UNI LightTest lights[MAX_LIGHTS];
//UNI Light lights[MAX_LIGHTS];

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

    mvMatrix = (viewMatrix * mMatrix);



    cameraSpace_pos = mvMatrix * pos;

    #ifdef HAS_TEXTURES
        texCoord.x *= inTextureRepeatOffset.TEX_REPEAT_X
        texCoord.x += inTextureRepeatOffset.TEX_OFFSET_X;
        texCoord.y *= inTextureRepeatOffset.TEX_REPEAT_Y
        texCoord.y += inTextureRepeatOffset.TEX_OFFSET_Y;
    #endif

   normInterpolated = vec3(normalMatrix*vec4(norm, 1.));
   vec3 normCameraSpace = normalize((vec4(normInterpolated, 1.0)).xyz);
   vec3 tangCameraSpace = normalize((mMatrix * vec4(attrTangent, 1.0)).xyz);
   //tangCameraSpace = normalize(tangCameraSpace - dot(tangCameraSpace, normCameraSpace) * normCameraSpace);
   vec3 bitangCameraSpace = normalize((mMatrix * vec4(attrBiTangent, 1.0)).xyz);

   //bitangCameraSpace = cross(normCameraSpace, tangCameraSpace);

   // * TODO: Transform lightDir and viewDir to TBN space here in vertex shader
   // * TODO: dont transfer normals from normalmap to world space in fragment
   // * TODO: since TBN is an orthogonal matrix, we can use transpose instead of inverse A^T = A^-1
   TBN_Matrix = mat3(tangCameraSpace, bitangCameraSpace, normCameraSpace);
   fragPos = vec3((mMatrix) * pos);

    #ifdef RECEIVE_SHADOW
        for (int i = 0; i < MAX_LIGHTS; i++) {
            Light light = vertexLights[i];
            if (light.type == DIRECTIONAL) {
                if (light.shadowMapIndex != -1) {
                    mat4 lightBiasMVP = light.mvpBiasMatrix;
                    lightSpace_fragPos[light.shadowMapIndex] = lightBiasMVP * pos;
                    shadowCoords[light.shadowMapIndex] = lightBiasMVP * mMatrix * pos; // vec4(fragPos, 1.);
                }
            }
            else continue;
        }
    #endif


   gl_Position = projMatrix * mvMatrix * pos;
}
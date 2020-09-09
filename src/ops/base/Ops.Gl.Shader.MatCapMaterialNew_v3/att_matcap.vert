IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;
IN vec3 attrTangent;
IN vec3 attrBiTangent;

#ifdef HAS_NORMAL_TEXTURE
    OUT vec3 vBiTangent;
    OUT vec3 vTangent;
#endif

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI vec3 camPos;

OUT vec2 texCoord;
OUT vec3 norm;
OUT vec3 fragPos;
OUT vec3 v_viewDirection;
OUT vec3 transformedNormal;
OUT mat3 normalMatrix;
UNI vec2 texOffset;
UNI vec2 texRepeat;

{{MODULES_HEAD}}

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    OUT vec3 eye_relative_pos;
#endif




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
    texCoord = texRepeat * vec2(attrTexCoord.x, attrTexCoord.y) + texOffset;
    texCoord.y = 1. - texCoord.y;

    norm=attrVertNormal;

    mat4 mMatrix=modelMatrix;
    mat4 mvMatrix;
    vec3 tangent=attrTangent;
    vec3 bitangent=attrBiTangent;

    #ifdef HAS_NORMAL_TEXTURE
        vTangent=attrTangent;
        vBiTangent=attrBiTangent;
    #endif

    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}


    mvMatrix= viewMatrix * mMatrix;
    normalMatrix = transposeMat3(inverseMat3(mat3(mMatrix)));

    #ifdef DO_PROJECT_COORDS_XY
       texCoord=(projMatrix * mvMatrix*pos).xy*0.1;
       texCoord.y = 1. - texCoord.y;
    #endif

    #ifdef DO_PROJECT_COORDS_YZ
       texCoord=(projMatrix * mvMatrix*pos).yz*0.1;
       texCoord.y = 1. - texCoord.y;
    #endif

    #ifdef DO_PROJECT_COORDS_XZ
        texCoord=(projMatrix * mvMatrix*pos).xz*0.1;
        texCoord.y = 1. - texCoord.y;
    #endif


    fragPos = vec3((mMatrix) * pos);
    v_viewDirection = camPos - fragPos;

    #ifdef CALC_SSNORMALS
        eye_relative_pos = -v_viewDirection;
    #endif

    v_viewDirection = normalize(v_viewDirection);
    transformedNormal = normalize(mat3(normalMatrix) * norm);

   gl_Position = projMatrix * mvMatrix * pos;

}
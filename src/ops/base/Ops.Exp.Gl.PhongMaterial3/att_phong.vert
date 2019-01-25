{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;
IN vec3 attrTangent;
IN vec3 attrBiTangent;
IN float attrVertIndex;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 norm;
OUT mat4 mvMatrix;
// OUT mat3 normalMatrix;
OUT vec4 modelPos;
OUT vec2 texCoord;
OUT vec3 mvPos;


// #ifdef HAS_TEXTURE_NORMAL
    OUT vec3 EyeDirection_tangentspace;
    // OUT vec3 LightDirection_tangentspace;
    OUT mat3 TBN;
    UNI vec3 camPos;
    OUT vec3 EyeDirection_cameraspace;
    // OUT mat4 vMatrix;
// #endif


mat3 transposeMat3(mat3 m)
{
    return mat3(m[0][0], m[1][0], m[2][0],
        m[0][1], m[1][1], m[2][1],
        m[0][2], m[1][2], m[2][2]);
}

// mat3 inverseMat3(mat3 m)
// {
//     float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
//     float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
//     float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

//     float b01 = a22 * a11 - a12 * a21;
//     float b11 = -a22 * a10 + a12 * a20;
//     float b21 = a21 * a10 - a11 * a20;

//     float det = a00 * b01 + a01 * b11 + a02 * b21;

//     return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
//         b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
//         b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
// }

void main()
{
    vec4 pos = vec4( vPosition, 1. );
    mat4 mMatrix=modelMatrix;

    #ifdef HAS_TEXTURES
        texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);
    #endif



    norm=attrVertNormal;




    {{MODULE_VERTEX_POSITION}}
    modelPos=mMatrix*pos;

    mvMatrix=viewMatrix*mMatrix;

    // #ifdef WEBGL1
    // normalMatrix = transposeMat3(inverseMat3(mat3(mMatrix)));
    // #endif
    // #ifdef WEBGL2
    // normalMatrix=mat3(inverse(transpose(mvMatrix)));
    // #endif

    // #ifdef HAS_TEXTURE_NORMAL
    mvPos=(mvMatrix * pos).xyz;
    EyeDirection_cameraspace = vec3(0.0,0.0,0.0) - mvPos;

    // vMatrix=viewMatrix;


	vec3 vertexTangent_cameraspace = ( vec4(normalize(attrTangent),1.0)).xyz;
	vec3 vertexBitangent_cameraspace = ( vec4(normalize(attrBiTangent),1.0)).xyz;
	vec3 vertexNormal_cameraspace = ( vec4(normalize(attrVertNormal),1.0)).xyz;

	TBN = transposeMat3(mat3(
		vertexTangent_cameraspace,
		vertexBitangent_cameraspace,
		vertexNormal_cameraspace
	)); // You can use dot products instead of building this matrix and transposing it. See References for details.

	EyeDirection_tangentspace =  TBN * EyeDirection_cameraspace;


    // #endif



    gl_Position = projMatrix * mvMatrix * pos;
}


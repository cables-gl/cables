
{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;
IN vec3 attrTangent;
IN vec3 attrBiTangent;

OUT vec2 texCoord;
OUT vec3 norm;
OUT vec3 normInterpolated;
OUT vec3 vertPosOut;
OUT vec3 noViewMatVertPos;
OUT vec3 v_Vertex;
OUT vec3 fragPos;
OUT mat3 TBN_Matrix; // tangent bitangent normal space transform matrix

UNI vec3 camPos;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;
UNI mat4 normalMatrix;

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
   mat4 MV_Matrix = (viewMatrix * mMatrix);
   vec4 pos=vec4(vPosition,  1.0);

   texCoord=attrTexCoord;
   norm=attrVertNormal;

   vec4 cameraSpace_pos = MV_Matrix * pos;
   {{MODULE_VERTEX_POSITION}}

   //vec3 _norm = ((viewMatrix*mMatrix)* vec4(norm, 0.0)).xyz;
   vec3 norm = transposeMat3(inverseMat3(mat3(mMatrix)))*norm;
   normInterpolated = norm;
   vec3 normCameraSpace = normalize((mMatrix * vec4(attrVertNormal, 1.0)).xyz);
   vec3 tangCameraSpace = normalize((mMatrix * vec4(attrTangent, 1.0)).xyz);
   vec3 bitangCameraSpace = normalize((mMatrix * vec4(attrBiTangent, 1.0)).xyz);
   //normInterpolated = vec3(normalMatrix*vec4(norm, 1.0));
   //normInterpolated = (transpose(inverse(mMatrix))*vec4(norm, 1.0)).xyz;

   // * TODO: Transform lightDir and viewDir to TBN space here in vertex shader
   // * TODO: dont transfer normals from normalmap to world space in fragment
   // * TODO: since TBN is an orthogonal matrix, we can use transpose instead of inverse A^T = A^-1
   TBN_Matrix = mat3(tangCameraSpace, bitangCameraSpace, normCameraSpace);

   //TBN_Matrix =
   fragPos = vec3((mMatrix) * pos);
   vertPosOut = vec3(cameraSpace_pos.xyz); ///_vertPosOut.w;

   noViewMatVertPos = vec3((mMatrix) * pos);



   gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;
}
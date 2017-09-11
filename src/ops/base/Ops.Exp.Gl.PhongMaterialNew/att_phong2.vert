
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


OUT vec3 norm;
OUT vec3 vert;
OUT mat4 mvMatrix;
// UNI mat4 normalMatrix;

OUT vec3 vViewPosition;
OUT vec3 vNormal;


#ifdef HAS_TEXTURES
    OUT  vec2 texCoord;
#endif


OUT mat3 normalMatrix;
OUT vec4 modelPos;






// import some common functions not supported by GLSL ES
float transpose_1_0(float m) {
  return m;
}

mat2 transpose_1_0(mat2 m) {
  return mat2(m[0][0], m[1][0],
              m[0][1], m[1][1]);
}

mat3 transpose_1_0(mat3 m) {
  return mat3(m[0][0], m[1][0], m[2][0],
              m[0][1], m[1][1], m[2][1],
              m[0][2], m[1][2], m[2][2]);
}

mat4 transpose_1_0(mat4 m) {
  return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
              m[0][1], m[1][1], m[2][1], m[3][1],
              m[0][2], m[1][2], m[2][2], m[3][2],
              m[0][3], m[1][3], m[2][3], m[3][3]);
}


mat3 inverse_2_1(mat3 m) {
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
    norm=attrVertNormal;
    vert=vPosition;

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    vec4 pos = vec4( vPosition, 1. );
    modelPos=modelMatrix*pos;
    mvMatrix=viewMatrix * modelMatrix;



    {{MODULE_VERTEX_POSITION}}

    vec4 viewModelPosition = mvMatrix * pos;
    vViewPosition = viewModelPosition.xyz;

    // vViewPosition = (viewMatrix*vec4(1.0,1.0,1.0,1.0)).xyz;

    // Rotate the object normals by a 3x3 normal matrix.
    // We could also do this CPU-side to avoid doing it per-vertex
    normalMatrix = transpose_1_0(inverse_2_1(mat3(mvMatrix)));
    vNormal = normalize(normalMatrix * norm);

    gl_Position = projMatrix * mvMatrix * pos;
}




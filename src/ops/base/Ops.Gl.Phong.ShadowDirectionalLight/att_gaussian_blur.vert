
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;

OUT vec2 texCoord;
OUT vec3 norm;

OUT vec2 coord0;
OUT vec2 coord1;
OUT vec2 coord2;
OUT vec2 coord3;
OUT vec2 coord4;
OUT vec2 coord5;
OUT vec2 coord6;

UNI mat4 projMatrix;
UNI mat4 mvMatrix;
UNI mat4 modelMatrix;

UNI vec2 inXY;
UNI float texelSize;

void main() {
    texCoord=attrTexCoord;
    norm=attrVertNormal;
    vec4 pos = vec4(vPosition,  1.0);

    {{MODULE_VERTEX_POSITION}}

    vec2 dir = inXY;

    vec2 res = inXY;
    // vec2 res = vec2(texelSize)*dir;

    coord3= attrTexCoord;


    coord0= attrTexCoord + (-3.0368997744118595 * res);
    coord1= attrTexCoord + (-2.089778445362373 * res);
    coord2= attrTexCoord + (-1.2004366090034069 * res);
    coord4= attrTexCoord + (1.2004366090034069 * res);
    coord5= attrTexCoord + (2.089778445362373* res);
    coord6= attrTexCoord + (3.0368997744118595 * res);

    gl_Position = projMatrix * mvMatrix * pos;
}
IN vec3 vPosition;
IN vec2 attrTexCoord;

OUT vec2 texCoord;
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

void main() {
    texCoord=attrTexCoord;

    vec4 pos = vec4(vPosition,  1.0);

    {{MODULE_VERTEX_POSITION}}

    coord3 = texCoord;


    coord0 = texCoord + (-3.0368997744118595 * inXY);
    coord0 = clamp(coord0, 0., 1.);
    coord1 = texCoord + (-2.089778445362373 * inXY);
    coord1 = clamp(coord1, 0., 1.);
    coord2 = texCoord + (-1.2004366090034069 * inXY);
    coord2 = clamp(coord2, 0., 1.);
    coord4 = texCoord + (1.2004366090034069 * inXY);
    coord4 = clamp(coord4, 0., 1.);
    coord5 = texCoord + (2.089778445362373* inXY);
    coord5 = clamp(coord5, 0., 1.);
    coord6 = texCoord + (3.0368997744118595 * inXY);
    coord6 = clamp(coord6, 0., 1.);

    gl_Position = projMatrix * mvMatrix * pos;
}
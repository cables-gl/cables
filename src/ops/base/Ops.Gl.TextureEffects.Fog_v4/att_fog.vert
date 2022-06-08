IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;

OUT vec2 texCoord;
OUT vec3 norm;

UNI mat4 projMatrix;
UNI mat4 mvMatrix;
UNI mat4 modelMatrix;

void main()
{
    texCoord = attrTexCoord;
    norm = attrVertNormal;
    vec4 pos = vec4(vPosition,  1.0);

    {{MODULE_VERTEX_POSITION}}

    gl_Position = projMatrix * mvMatrix * pos;

}

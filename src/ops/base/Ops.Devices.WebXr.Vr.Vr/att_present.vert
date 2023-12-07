{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;

IN float attrVertIndex;

OUT vec2 texCoord;
OUT vec3 norm;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;

void main()
{
    texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);
    vec4 pos=vec4(vPosition,  1.0);
    mat4 mMatrix=modelMatrix;
    {{MODULE_VERTEX_POSITION}}
    gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;
}

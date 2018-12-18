{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrBarycentric;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
OUT vec3 barycentric;
IN vec2 attrTexCoord;
OUT vec2 texCoord;

IN vec3 attrVertNormal;
OUT vec3 norm;

void main()
{
    norm=attrVertNormal;
    texCoord=attrTexCoord;
    barycentric=attrBarycentric;
    vec4 pos = vec4( vPosition, 1. );
    {{MODULE_VERTEX_POSITION}}
    gl_Position = projMatrix * viewMatrix * modelMatrix * pos;
}

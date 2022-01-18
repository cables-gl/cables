{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrVertColor;
OUT vec4 vertColor;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
IN vec3 attrVertNormal;

void main()
{
    mat4 mMatrix=modelMatrix;
    vertColor.rgb=attrVertColor;
    vec3 norm=attrVertNormal;
    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix*mMatrix;

   gl_Position = projMatrix * mvMatrix * pos;
}
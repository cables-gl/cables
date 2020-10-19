{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrVertColor;
OUT vec4 vertColor;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;

void main()
{
   vertColor.rgb=attrVertColor;
    vec4 pos = vec4( vPosition, 1. );

{{MODULE_VERTEX_POSITION}}

   gl_Position = projMatrix * mvMatrix * pos;
}
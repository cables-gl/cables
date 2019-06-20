{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrVertColor;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;
OUT vec4 color;

void main()
{
   color.rgb=attrVertColor;
    vec4 pos = vec4( vPosition, 1. );

{{MODULE_VERTEX_POSITION}}

   gl_Position = projMatrix * mvMatrix * pos;
}
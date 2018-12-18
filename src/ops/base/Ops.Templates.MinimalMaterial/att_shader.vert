{{MODULES_HEAD}}

IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;

void main()
{
   vec4 pos=vec4(vPosition,  1.0);
   {{MODULE_VERTEX_POSITION}}
   gl_Position = projMatrix * mvMatrix * pos;
}

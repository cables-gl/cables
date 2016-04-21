{{MODULES_HEAD}}

attribute vec3 vPosition;
uniform mat4 projMatrix;
uniform mat4 mvMatrix;

void main()
{
   vec4 pos=vec4(vPosition,  1.0);
   {{MODULE_VERTEX_POSITION}}
   gl_Position = projMatrix * mvMatrix * pos;
}

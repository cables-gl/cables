

IN vec3 vPosition;

IN vec2 pos;

uniform mat4 projMatrix;
uniform mat4 mvMatrix;

void main()
{
   vec4 pos=vec4(vPosition,  1.0);

   gl_Position = projMatrix * mvMatrix * pos;
}

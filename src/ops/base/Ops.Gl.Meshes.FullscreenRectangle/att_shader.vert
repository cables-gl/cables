{{MODULES_HEAD}}

attribute vec3 vPosition;
uniform mat4 projMatrix;
uniform mat4 mvMatrix;

varying vec2 texCoord;
attribute vec2 attrTexCoord;

void main()
{
   vec4 pos=vec4(vPosition,  1.0);
   
   texCoord=attrTexCoord;


   gl_Position = projMatrix * mvMatrix * pos;
}

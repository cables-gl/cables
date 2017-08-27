{{MODULES_HEAD}}

IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;

OUT vec2 texCoord;
IN vec2 attrTexCoord;

void main()
{
   vec4 pos=vec4(vPosition,  1.0);

   texCoord=attrTexCoord;


   gl_Position = projMatrix * mvMatrix * pos;
}

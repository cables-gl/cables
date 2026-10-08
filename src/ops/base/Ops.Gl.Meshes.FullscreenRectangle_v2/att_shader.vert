{{MODULES_HEAD}}

IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;
UNI vec2 texScale;

OUT vec2 texCoord;
IN vec2 attrTexCoord;

void main()
{
   vec4 pos=vec4(vPosition,  1.0);

   texCoord=(vec2(attrTexCoord.x,(1.0-attrTexCoord.y))-0.5)*texScale+0.5;

   gl_Position = projMatrix * mvMatrix * pos;
}

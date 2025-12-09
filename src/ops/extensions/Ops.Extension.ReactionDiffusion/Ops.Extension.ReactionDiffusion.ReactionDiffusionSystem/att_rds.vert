IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;
OUT vec2 texCoord;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;
UNI int flipTexture;

void main()
{
   texCoord=attrTexCoord;
   vec4 pos=vec4(vPosition,  1.0);
   mat4 mMatrix=modelMatrix;

   gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;
}

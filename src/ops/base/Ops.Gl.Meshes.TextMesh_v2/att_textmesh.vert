UNI sampler2D tex;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI float scale;
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN mat4 instMat;
IN vec2 attrTexOffsets;
IN vec2 attrTexSize;
IN vec2 attrTexPos;
OUT vec2 texPos;

OUT vec2 texCoord;

void main()
{
   texCoord=(attrTexCoord*(attrTexSize)) + attrTexOffsets;
   mat4 instModelMat=instMat;
   instModelMat[3][0]*=scale;

   texPos=attrTexPos;

   vec4 vert=vec4( vPosition.x*(attrTexSize.x/attrTexSize.y)*scale,vPosition.y*scale,vPosition.z*scale, 1. );

   mat4 mvMatrix=viewMatrix * modelMatrix * instModelMat;

   #ifndef BILLBOARD
       gl_Position = projMatrix * mvMatrix * vert;
   #endif
}

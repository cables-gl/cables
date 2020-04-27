UNI sampler2D tex1;
UNI sampler2D tex2;
UNI sampler2D tex3;
UNI sampler2D tex4;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI float scale;
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN mat4 instMat;
IN vec2 attrTexOffsets;
IN vec2 attrSize;
IN vec2 attrTcSize;
IN float attrPage;

OUT vec2 texCoord;
flat OUT int texIndex;

const float mulSize=0.01;


void main()
{
   texCoord=(attrTexOffsets+attrTexCoord*attrTcSize);
   texCoord.y=1.0-texCoord.y;

   mat4 instModelMat=instMat;
//   instModelMat[3][0]*=scale;

//   vec4 vert=vec4( vPosition.x*(attrTexSize.x/attrTexSize.y)*scale,vPosition.y*scale,vPosition.z*scale, 1. );
   vec4 vert=vec4( vPosition, 1. );
   vert.x*=attrSize.x*mulSize;
   vert.y*=attrSize.y*mulSize;

   texIndex=int(attrPage);

   mat4 mvMatrix=viewMatrix * modelMatrix * instModelMat;

   #ifndef BILLBOARD
       gl_Position = projMatrix * mvMatrix * vert;
   #endif
}

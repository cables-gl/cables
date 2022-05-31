precision highp float;
precision highp int;
precision highp sampler2D;

{{MODULES_HEAD}}
IN vec3 vPosition;
// IN vec2 attrTexCoord;
// IN vec3 attrVertNormal;
// IN vec3 attrTangent,attrBiTangent;
// IN float attrVertIndex;
// OUT vec2 texCoord;
// OUT vec3 norm;
OUT vec3 P;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;

void main()
{
//   texCoord     = attrTexCoord;
//   norm         = attrVertNormal;
   vec4 pos     = vec4(vPosition,  1.0);
   mat4 mMatrix = modelMatrix;

   {{MODULE_VERTEX_POSITION}}

   gl_Position  = pos;

   P            = (vPosition + 1.0) * 0.5;
}

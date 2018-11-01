{{MODULES_HEAD}}

IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;
IN vec2 attrTexCoord;
OUT mediump vec2 texCoord;

UNI float diffuseRepeatX;
UNI float diffuseRepeatY;
UNI float texOffsetX;
UNI float texOffsetY;

void main()
{
   texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);

   texCoord.s=texCoord.s*diffuseRepeatX+texOffsetX;
   texCoord.t=texCoord.t*diffuseRepeatY+texOffsetY;

   vec4 pos=vec4(vPosition,  1.0);
   {{MODULE_VERTEX_POSITION}}
   gl_Position = projMatrix * mvMatrix * pos;
}

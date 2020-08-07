{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;

OUT vec2 texCoord;
OUT vec3 norm;
OUT vec3 worldPos;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;

void main()
{
    texCoord=attrTexCoord;
    norm=attrVertNormal;
    vec4 pos=vec4(vPosition,  1.0);

    {{MODULE_VERTEX_POSITION}}

    mat4 mMatrix=modelMatrix;
    worldPos = vec3(mMatrix * pos);
    mat4 rotView = mat4(mat3(viewMatrix)); // remove translation from the view matrix
    vec4 clipPos = projMatrix * rotView * pos;

    gl_Position = clipPos.xyww;
}
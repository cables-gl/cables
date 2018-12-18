IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN vec3 attrTangent;
out vec2 texCoord;
out vec3 norm;
out vec3 tangent;
UNI mat4 projMatrix;
// UNI mat4 mvMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

{{MODULES_HEAD}}

void main()
{

    texCoord=attrTexCoord;
    norm=attrVertNormal;
    tangent=attrTangent;

    vec4 pos=vec4(vPosition,  1.0);
    mat4 mMatrix=modelMatrix;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix*mMatrix;

    gl_Position = projMatrix * mvMatrix * pos;
}
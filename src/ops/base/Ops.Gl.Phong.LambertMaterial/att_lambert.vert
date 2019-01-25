IN vec3 vPosition;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;

IN vec3 attrTangent;
IN vec3 attrBiTangent;
IN float attrVertIndex;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 norm;
OUT vec4 modelPos;
OUT vec2 texCoord;

{{MODULES_HEAD}}

void main()
{
    mat4 mvMatrix;

    vec4 pos = vec4( vPosition, 1. );
    mat4 mMatrix=modelMatrix;

    texCoord=attrTexCoord;

    norm=attrVertNormal;

    {{MODULE_VERTEX_POSITION}}

    mvMatrix=viewMatrix*mMatrix;
    modelPos=mMatrix*pos;

    gl_Position = projMatrix * mvMatrix * pos;
}

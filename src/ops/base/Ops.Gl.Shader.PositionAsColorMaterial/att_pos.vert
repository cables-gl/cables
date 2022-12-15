IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal,attrTangent,attrBiTangent;
OUT mat4 mMatrix;
OUT vec3 vert;
OUT mat4 mvMatrix;
UNI mat4 projMatrix;

UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

{{MODULES_HEAD}}

void main()
{

    vec4 pos=vec4(vPosition,1.0);
    mMatrix=modelMatrix;



    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix*mMatrix;


    vert=(mMatrix*pos).xyz;


    gl_Position = projMatrix * mvMatrix * pos;
}
{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;

IN vec3 attrTangent;
IN vec3 attrBiTangent;
IN float attrVertIndex;


OUT vec4 shadowCoord;
OUT vec4 vPos;
OUT vec3 modelPos;
OUT vec2 texCoord;
OUT vec3 norm;

UNI mat4 lightMVP;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

UNI mat4 lightBiasMVP;
void main() {
    vec4 pos = vec4(vPosition, 1.0);
    mat4 mMatrix = modelMatrix;

    vec3 tangent=attrTangent;
    vec3 bitangent=attrBiTangent;

    texCoord=attrTexCoord;

    norm=attrVertNormal;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix * modelMatrix;
    vPos = projMatrix * mvMatrix * vec4(vPosition, 1.);
    modelPos = (modelMatrix * pos).xyz;
    gl_Position = vPos;
}
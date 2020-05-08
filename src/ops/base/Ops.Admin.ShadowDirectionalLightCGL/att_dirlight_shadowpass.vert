{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;


UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

void main() {
    vec4 pos = vec4(vPosition, 1.0);
    mat4 mMatrix = modelMatrix;
    vec3 norm = attrVertNormal;
    vec2 texCoord = attrTexCoord;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix * modelMatrix;
    vec4 vPos = projMatrix * mvMatrix * vec4(vPosition, 1.);

    gl_Position = vPos;
}
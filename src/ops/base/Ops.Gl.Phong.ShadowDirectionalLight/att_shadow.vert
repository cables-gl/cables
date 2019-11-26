{{MODULES_HEAD}}
IN vec3 vPosition;

OUT vec4 shadowCoord;
OUT vec4 vPos;
UNI mat4 lightMVP;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;


UNI mat4 lightBiasMVP;
void main() {
    vec4 pos = vec4(vPosition, 1.0);
    {{MODULE_VERTEX_POSITION}}
    mat4 mvMatrix=viewMatrix * modelMatrix;
    vPos = projMatrix * mvMatrix * vec4(vPosition, 1.);
    gl_Position = vPos;
    // shadowCoord = lightBiasMVP * vec4(vPosition, 1.);
}
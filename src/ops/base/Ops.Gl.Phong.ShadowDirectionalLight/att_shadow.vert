{{MODULES_HEAD}}
IN vec3 vPosition;

OUT vec4 shadowCoord;

UNI mat4 lightMVP;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;


UNI mat4 lightBiasMVP;
void main() {
    vec4 pos = vec4(vPosition, 1.0);
    {{MODULE_VERTEX_POSITION}}
    mat4 mvMatrix=viewMatrix * modelMatrix;
    gl_Position = projMatrix * mvMatrix * vec4(vPosition, 1.);
    // shadowCoord = lightBiasMVP * vec4(vPosition, 1.);
}
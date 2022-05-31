precision highp float;
precision highp int;
precision highp sampler2D;


{{MODULES_HEAD}}
IN vec3 vPosition;
IN float attrVertIndex;

OUT vec3 FragPos;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;


void main()
{
    FragPos     = vPosition;

    {{MODULE_VERTEX_POSITION}}
    gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);
    gl_Position = gl_Position.xyww;
}

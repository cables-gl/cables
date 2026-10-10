IN vec3 vPosition;
IN vec4 attrVertColor;
OUT vec4 vertColor;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

void main()
{
    vertColor = attrVertColor;
    gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);
}

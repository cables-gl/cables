{{MODULES_HEAD}}

IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI float aspect;
OUT vec2 texCoord;
IN vec2 attrTexCoord;

void main()
{
    vec4 pos=vec4(vPosition,  1.0);

    pos.x*=aspect;

    texCoord=vec2(attrTexCoord.x,1.0-attrTexCoord.y);;

    mat4 mMatrix=modelMatrix;

    {{MODULE_VERTEX_POSITION}}
    mat4 modelViewMatrix=viewMatrix*mMatrix;

    gl_Position = projMatrix * modelViewMatrix * pos;
}

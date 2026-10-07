IN vec3 vPosition;
IN vec2 attrTexCoord;

UNI mat4 outModelMatrix;

OUT vec2 texCoord;
OUT vec4 posi;

{{MODULES_HEAD}}


void main()
{
    texCoord=attrTexCoord;
    {{MODULE_VERTEX_POSITION}}

    posi=outModelMatrix*vec4(0.,0.,0.,1.);

    gl_Position = vec4(vPosition,  1.0);
}
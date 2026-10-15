IN vec3 vPosition;
IN vec2 attrTexCoord;
OUT vec2 texCoord;

void main()
{
    texCoord = attrTexCoord;
    gl_Position = vec4(vPosition, 1.0);
}

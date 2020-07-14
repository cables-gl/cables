{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;

OUT vec2 texCoord;
OUT vec3 norm;
OUT vec3 worldPos;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;

const vec2 scale = vec2(0.5, 0.5);

void main()
{
        texCoord=attrTexCoord;
        norm=attrVertNormal;
        vec4 pos=vec4(vPosition,  1.0);

        {{MODULE_VERTEX_POSITION}}

        gl_Position = pos;
}
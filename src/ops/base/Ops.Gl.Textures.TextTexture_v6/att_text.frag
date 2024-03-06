{{MODULES_HEAD}}

UNI sampler2D tex;
UNI float a;
UNI vec4 color;
IN vec2 texCoord;

void main()
{

    vec4 col=texture(tex,vec2(texCoord.x,(1.0-texCoord.y)));

    {{MODULE_COLOR}}

    outColor=col;
}

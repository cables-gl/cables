
IN vec2 texCoord;
IN float r;
UNI float a;
UNI sampler2D tex;

{{MODULES_HEAD}}
void main()
{
    vec4 col=vec4(1.0,1.0,1.0,1.0);

    // vec4 col=vec4(r,r,1.0,0.5);

    col.rg=texCoord.xy;

    // col=texture(tex,texCoord);

    {{MODULE_COLOR}}
    outColor = col;
}
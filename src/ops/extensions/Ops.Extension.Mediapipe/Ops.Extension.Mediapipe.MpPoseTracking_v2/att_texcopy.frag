UNI sampler2D tex;
IN vec2 texCoord;


void main()
{
    vec2 tc=vec2(texCoord.x,texCoord.y);

    #ifdef FLIPX
        tc.x=1.0-texCoord.x;
    #endif
    #ifdef FLIPY
        tc.y=1.0-texCoord.y;
    #endif
    outColor=texture(tex,tc);
}
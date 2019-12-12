
UNI sampler2D tex;
UNI float amount;
UNI float pass;

IN vec2 texCoord;

UNI float dirX;
UNI float dirY;
UNI float width;
UNI float height;

IN vec2 coord0;
IN vec2 coord1;
IN vec2 coord2;
IN vec2 coord3;
IN vec2 coord4;
IN vec2 coord5;
IN vec2 coord6;

#ifdef HAS_MASK
    UNI sampler2D imageMask;
#endif

void main()
{
    vec4 color = vec4(0.0);

// color += texture(tex, texCoord+1.0/1024.0*0.5);

    color += texture(tex, coord0) * 0.06927096443792478;
    color += texture(tex, coord1) * 0.1383328848652136;
    color += texture(tex, coord2) * 0.21920904690397863;
    color += texture(tex, coord3) * 0.14637421;
    color += texture(tex, coord4) * 0.21920904690397863;
    color += texture(tex, coord5) * 0.1383328848652136;
    color += texture(tex, coord6) * 0.06927096443795711;

    color.a=1.0;
    outColor= color;
}
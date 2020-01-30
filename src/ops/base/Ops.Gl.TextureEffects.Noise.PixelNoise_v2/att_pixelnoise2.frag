IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float numX;
UNI float numY;
UNI float addX;
UNI float addY;
UNI float addZ;
UNI float seed2;
UNI float minIn;
UNI float maxIn;

float random(vec2 co)
{
    float r=fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (5.711+(mod(addZ+5711.210,57111.0))));

    #ifdef LOOP
        r=abs(r-0.5)*2.0;
    #endif

    return r;
}

{{CGL.BLENDMODES}}

void main()
{
    vec2 seed=vec2(0.0);

    #ifndef CENTER
        seed=vec2(floor( texCoord.x*numX+addX),floor( texCoord.y*numY+addY));
    #endif
    #ifdef CENTER
        seed=vec2(floor( (texCoord.x-0.5)*numX+addX),floor( (texCoord.y-0.5)*numY+addY));
    #endif

    float r,g,b;

    #ifndef RGB
        r=g=b=random( seed + 0.5711 + seed2 );
    #endif

    #ifdef RGB
        r=random( seed+0.5711 + seed2);
        g=random( seed+0.5712 + seed2);
        b=random( seed+0.5713 + seed2);
    #endif

    vec4 rnd = clamp( vec4( r,g,b,1.0 ),vec4(minIn), vec4(maxIn) );

    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,rnd,amount);

}
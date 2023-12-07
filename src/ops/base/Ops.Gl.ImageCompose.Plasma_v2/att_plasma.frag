#define PI 3.1415926535897932384626433832795

IN vec2 texCoord;

UNI sampler2D tex;
UNI vec2 size;
UNI vec2 pos;
UNI float mul;
UNI float amount;
UNI float time;
UNI float aspect;

#ifdef HAS_TEX_OFFSETMAP
    UNI sampler2D texOffsetZ;
    UNI float offMul;
#endif

#ifdef HAS_TEX_MASK
    UNI sampler2D texMask;
#endif


{{CGL.BLENDMODES3}}

void main()
{
    float v = 0.0;

    vec2 s=size;
    #ifdef FIXASPECT
        s.y=size.x/aspect;
    #endif

    vec2 c = texCoord * s - s/2.0;

    c+=pos;

    vec3 offset;
    #ifdef HAS_TEX_OFFSETMAP
        vec4 offMap=texture(texOffsetZ,texCoord);

        #ifdef OFFSET_X_R
            offset.x=offMap.r;
        #endif
        #ifdef OFFSET_X_G
            offset.x=offMap.g;
        #endif
        #ifdef OFFSET_X_B
            offset.x=offMap.b;
        #endif

        #ifdef OFFSET_Y_R
            offset.y=offMap.r;
        #endif
        #ifdef OFFSET_Y_G
            offset.y=offMap.g;
        #endif
        #ifdef OFFSET_Y_B
            offset.y=offMap.b;
        #endif

        #ifdef OFFSET_Z_R
            offset.z=offMap.r;
        #endif
        #ifdef OFFSET_Z_G
            offset.z=offMap.g;
        #endif
        #ifdef OFFSET_Z_B
            offset.z=offMap.b;
        #endif
        offset*=offMul;
    #endif

    c+=offset.xy;
    float t=time+offset.z;

    v += sin((c.x+t));
    v += sin((c.y+t)/2.0);
    v += sin((c.x+c.y+t)/2.0);
    c += size/2.0 * vec2(sin(t/3.0), cos(t/2.0));

    v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+t);
    v = v/2.0;

    vec3 newColor = vec3(sin(PI*v*mul/4.0), sin(PI*v*mul), cos(PI*v*mul))*.5 + .5;
    vec4 base=texture(tex,texCoord);

    #ifndef GREY
       vec4 col=vec4( _blend(base.rgb,newColor) ,1.0);
    #endif
    #ifdef GREY
       vec4 col=vec4( _blend(base.rgb,vec3(newColor.g)) ,1.0);
    #endif

    float str=1.0;
    #ifdef HAS_TEX_MASK
        str=texture(texMask,texCoord).r;
    #endif

    outColor=cgl_blendPixel(base,col,amount*str);
}


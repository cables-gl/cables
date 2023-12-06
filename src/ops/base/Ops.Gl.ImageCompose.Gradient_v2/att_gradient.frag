IN vec2 texCoord;
UNI float amount;
UNI float pos;
UNI float width;

UNI vec3 colA;
UNI vec3 colB;
UNI vec3 colC;
UNI sampler2D tex;

{{CGL.BLENDMODES3}}




vec3 lin2srgb( vec3 cl )
{
	cl = clamp( cl, 0.0, 1.0 );
	vec3 c_lo = 12.92 * cl;
	vec3 c_hi = 1.055 * pow(cl,vec3(0.41666,0.41666,0.41666)) - 0.055;
	return vec3( (cl.r<0.0031308) ? c_lo.r : c_hi.r,
                (cl.g<0.0031308) ? c_lo.g : c_hi.g,
                (cl.b<0.0031308) ? c_lo.b : c_hi.b );
}

vec3 oklab_mix( vec3 colA, vec3 colB, float h )
{
    // https://www.shadertoy.com/view/ttcyRS
    // https://bottosson.github.io/posts/oklab
    const mat3 kCONEtoLMS = mat3(
         0.4121656120,  0.2118591070,  0.0883097947,
         0.5362752080,  0.6807189584,  0.2818474174,
         0.0514575653,  0.1074065790,  0.6302613616);
    const mat3 kLMStoCONE = mat3(
         4.0767245293, -1.2681437731, -0.0041119885,
        -3.3072168827,  2.6093323231, -0.7034763098,
         0.2307590544, -0.3411344290,  1.7068625689);

    // rgb to cone (arg of pow can't be negative)
    vec3 lmsA = pow( kCONEtoLMS*colA, vec3(1.0/3.0) );
    vec3 lmsB = pow( kCONEtoLMS*colB, vec3(1.0/3.0) );
    // lerp
    vec3 lms = mix( lmsA, lmsB, h );
    // gain in the middle (no oaklab anymore, but looks better?)
    #ifdef OKLABGAIN
  lms *= 1.0+0.2*h*(1.0-h);
  #endif
    // cone to rgb
    return kLMStoCONE*(lms*lms*lms);
}


void main()
{
    vec4 base=texture(tex,texCoord);
    vec4 col;
    float ax=texCoord.x;

    #ifdef GRAD_Y
        ax=texCoord.y;
    #endif
    #ifdef GRAD_XY
        ax=(texCoord.x+texCoord.y)/2.0;
    #endif
    #ifdef GRAD_RADIAL
        ax=distance(texCoord,vec2(0.5,0.5))*2.0;
    #endif

    ax=((ax-0.5)*width)+0.5;
ax=clamp(ax,0.0,1.0);

    #ifndef GRAD_SMOOTHSTEP
        if(ax<=pos) col = vec4(MIXER(colA, colB, ax*1.0/pos),1.0);
        else col = vec4(MIXER(colB, colC, min(1.0,(ax-pos)*1.0/(1.0-pos))),1.0);
    #endif

    #ifdef GRAD_SMOOTHSTEP
        if(ax<=pos) col = vec4(MIXER(colA, colB, smoothstep(0.0,1.0,ax*1.0/pos)),1.0);
        else col = vec4(MIXER(colB, colC, smoothstep(0.0,1.0,min(1.0,(ax-pos)*1.0/(1.0-pos)))),1.0);
    #endif

    #ifdef SRGB
        col.rgb=lin2srgb(col.rgb);
    #endif

    outColor=cgl_blendPixel(base,col,amount);
}
IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float scale;
UNI float phase;
UNI vec2 offset;


{{MODULES_HEAD}}
{{CGL.BLENDMODES3}}

vec2 hash( in vec2 x )
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return fract( 16.0*k*fract( x.x*x.y*(x.x+x.y)) );
}


vec3 gabor_wave(in vec2 p)
{
    vec2  ip = floor(p);
    vec2  fp = fract(p);

    const float fr = 2.0*6.283185;
    const float fa = 4.0;

    vec3 av = vec3(0.0,0.0,0.0);
    vec3 at = vec3(0.0,0.0,0.0);
	for( int j=-1; j<=1; j++ ) // can reduce this search to just [-1,1]
    for( int i=-1; i<=1; i++ ) // if you are okey with some small errors
	{
        vec2  o = vec2( i, j );
        vec2  h = hash(ip+o);
        vec2  r = fp - (o+h);

        vec2  k = normalize(-1.0+2.0*hash(ip+o+vec2(11,31)) );

        float d = dot(r, r)+phase;
        float l = dot(r, k)+phase;
        float w = exp(-fa*d);
        vec2 cs = vec2( cos(fr*l), sin(fr*l) );

        av += w*vec3(cs.x, -2.0*fa*r*cs.x - cs.y*fr*k );
        at += w*vec3(1.0,  -2.0*fa*r);
	}
    return vec3( av.x, av.yz-av.x*at.yz/at.x  ) /at.x;
}

void main()
{
    vec3 f=gabor_wave( (texCoord-0.5)*scale+offset);
    vec4 rnd = vec4(vec3(vec3(0.5) + vec3(0.5)*f),1.0);

    #ifdef CHAN_RGB
    #endif
    #ifdef CHAN_R
        rnd = vec4(rnd.x,rnd.x,rnd.x,1.0);
    #endif
    #ifdef CHAN_G
        rnd = vec4(rnd.y,rnd.y,rnd.y,1.0);
    #endif
    #ifdef CHAN_B
        rnd = vec4(rnd.z,rnd.z,rnd.z,1.0);
    #endif

    vec4 base=texture(tex,texCoord);

    vec4 col=rnd;

    outColor = cgl_blendPixel(base, col, amount);

}





//
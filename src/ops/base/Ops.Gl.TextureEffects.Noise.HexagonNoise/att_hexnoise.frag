IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float scale;
UNI float addX;
UNI float addY;
UNI float addZ;
UNI float seed2;
UNI float minIn;
UNI float maxIn;

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

//cell code from https://www.shadertoy.com/view/lldfWH
vec4 hex(vec2 uv, out vec2 id) {
    uv *= mat2(1.1547,0.0,-0.5773503,1.0);
    vec2 f = fract(uv);
    float triid = 1.0;
	if((f.x+f.y) > 1.0) { f = 1.0 - f; triid = -1.0; }

    vec2 co = step(f.yx,f) * step(1.0-f.x-f.y,max(f.x,f.y));
    id = floor(uv) + (triid < 0.0 ? 1.0 - co : co);
    co = (f - co) * triid * mat2(0.866026,0.0,0.5,1.0);

    uv = abs(co);
    return vec4(0.5-max(uv.y,abs(dot(vec2(0.866026,0.5),uv))),length(co),co);
}

float random(vec2 co)
{
     float r=fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (5.711+(mod(addZ+5711.210,57.0))));

    #ifdef LOOP
        r=abs(r-0.5)*2.0;
    #endif

    return r;
}


{{CGL.BLENDMODES}}

void main()
{
    vec2 uv = texCoord;
    uv -= 0.5;
    uv -= vec2(addX,addY);
    uv*=scale;

    #ifdef FLIP
        pR(uv.xy,0.25*TAU);
    #endif
    float r,g,b;
    vec4 rnd = vec4(0.0);
    // get hexagon cell id
    vec2 id0;
    vec4 h = hex(uv*4.0, id0);

    #ifndef RGB
        r=g=b= random(id0.xy*id0.xy+seed2);
    #endif

    #ifdef RGB
        r =random(((id0.xy*id0.xy)*0.234)+seed2);
        g = random(((id0.xy*id0.xy)*0.234)+seed2+0.9812);
        b = random(((id0.xy*id0.xy)*0.234)+seed2+57.101);
    #endif
    rnd = clamp( vec4( r,g,b,1.0 ),vec4(minIn), vec4(maxIn) );
    //rnd = clamp
    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,rnd,amount);

}
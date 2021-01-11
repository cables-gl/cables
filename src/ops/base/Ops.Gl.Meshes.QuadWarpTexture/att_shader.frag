UNI sampler2D tex;
IN vec2 texCoord;

UNI vec2 a;
UNI vec2 b;
UNI vec2 c;
UNI vec2 d;
{{MODULES_HEAD}}

float cross2d( in vec2 a, in vec2 b ) { return a.x*b.y - a.y*b.x; }

// original function by iq : https://www.shadertoy.com/view/lsBSDm
vec2 invBilinear( in vec2 p, in vec2 a, in vec2 b, in vec2 c, in vec2 d )
{
    vec2 e = b-a;
    vec2 f = d-a;
    vec2 g = a-b+c-d;
    vec2 h = p-a;

    float k2 = cross2d( g, f );
    float k1 = cross2d( e, f ) + cross2d( h, g );
    float k0 = cross2d( h, e );

    float w = k1*k1 - 4.0*k0*k2;
    if( w<0.0 ) return vec2(-1.0);
    w = sqrt( w );

    // will fail for k0=0, which is only on the ba edge
    float v = 2.0*k0/(-k1 - w);
    if( v<0.0 || v>1.0 ) v = 2.0*k0/(-k1 + w);

    float u = (h.x - f.x*v)/(e.x + g.x*v);
    if( u<0.0 || u>1.0 || v<0.0 || v>1.0 ) return vec2(-1.0);
    return vec2( u, v );
}

void main()
{
    vec2 uv=invBilinear(texCoord,a,b,c,d);
    vec4 col=texture(tex,1.0-uv);
    if(uv.x==-1.0 || uv.y==-1.0)discard;
    {{MODULE_COLOR}}
    outColor = col;
}

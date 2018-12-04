IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float inner;
UNI float outer;

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    vec2 x = texCoord - vec2(0.5);
    float radius = length(x);
    float angle = atan(x.y, x.x);

    vec2 tc;
    tc.s = ( radius - inner) / (outer - inner);
    tc.t = angle * 0.5 / 3.141592653589793 + 0.5;

    #ifdef CROP_IMAGE
        if(tc.s<0.0 || tc.t<0.0 || tc.s>1.0 || tc.t>1.0) discard;
    #endif

    col=texture(tex,tc);
    outColor= col;
}

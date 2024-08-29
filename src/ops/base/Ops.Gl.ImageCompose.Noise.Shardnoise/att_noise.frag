IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float scale;
UNI float phase;
UNI vec3 offset;
UNI float sharpness;
UNI float harmonics;
UNI float aspect;

{{MODULES_HEAD}}

{{CGL.BLENDMODES3}}


vec3 hash(vec3 p)
{
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5,183.3,246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    p = fract(sin(p) * 43758.5453123);
    return p;
}

#define tau 6.283185307179586

float shard_noise(in vec3 p, in float sharpness)
{
    vec3 ip = floor(p);
    vec3 fp = fract(p);

    float v = 0., t = 0.;
    for (int z = -1; z <= 1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec3 o = vec3(x, y, z);
                vec3 io = ip + o;
                vec3 h = hash(io);
                vec3 r = fp - (o + h);

                float w = exp2(-tau*dot(r, r));
                // tanh deconstruction and optimization by @Xor
                float s = sharpness * dot(r, hash(io + vec3(11, 31, 47)) - 0.5);
                v += w * s*inversesqrt(1.0+s*s);
                t += w;
            }
        }
    }
    return ((v / t) * .5) + .5;
}

void main()
{
    vec2 tc=texCoord;
    tc.x*=aspect;
    float f=shard_noise( (vec3( ( (tc.xy-0.5)*scale+offset.xy),offset.z)),pow(sharpness*20.0,2.0));

    #ifdef HARMONICS
        f*=0.8;
        if (harmonics >= 2.0) f += shard_noise( (vec3( ( (tc.xy-0.5)*(scale*2.0)+offset.xy),offset.z)),pow(sharpness*20.0,2.0))* (0.5*0.5);
        if (harmonics >= 3.0) f += shard_noise( (vec3( ( (tc.xy-0.5)*(scale*4.0)+offset.xy),offset.z)),pow(sharpness*20.0,2.0))* (0.25*0.5);
        if (harmonics >= 4.0) f += shard_noise( (vec3( ( (tc.xy-0.5)*(scale*8.0)+offset.xy),offset.z)),pow(sharpness*20.0,2.0))* (0.125*0.5);
        if (harmonics >= 5.0) f += shard_noise( (vec3( ( (tc.xy-0.5)*(scale*16.0)+offset.xy),offset.z)),pow(sharpness*20.0,2.0))* (0.0625*0.5);
    #endif

    #ifdef ROUND
        f=round(f);
    #endif
    vec4 rnd = vec4(vec3(f),1.0);

    vec4 base=texture(tex,texCoord);

    vec4 col=rnd;

    outColor = cgl_blendPixel(base, col, amount);

}





//
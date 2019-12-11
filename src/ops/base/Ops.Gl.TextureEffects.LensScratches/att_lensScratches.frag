IN vec2 texCoord;
UNI sampler2D tex;
UNI float uOffsetX;
UNI float uOffsetY;
UNI float uWavyness;
UNI float uScale;
UNI int uLayers;
UNI float uAntiAliasIterations;
UNI float uFrequency;
UNI float uFrequencyStep;
UNI float uResWidth;
UNI float uResHeight;
UNI float uAspect;
UNI float amount;

{{CGL.BLENDMODES}}
//Shader kindly used with the permission of Tropical trevor
//shadertoy user Daedelus
//https://www.shadertoy.com/view/4syXRD

void pR(inout vec2 p, float a)
{
    float sa = sin(a);
    float ca = cos(a);
    p *= mat2(ca, sa, -sa, ca);
}

float scratch(vec2 uv, vec2 seed)
{
    seed.x = floor(sin(seed.x * 51024.0) * 3104.0);
    seed.y = floor(sin(seed.y * 1324.0) * 554.0);

    uv = uv * 2.0 - 1.0;
    pR(uv, seed.x + seed.y);
    uv += sin(seed.x - seed.y);
    uv = clamp(uv * 0.5 + 0.5, 0.0, 1.0);

    float s1 = sin(seed.x + uv.y * 3.1415) * uWavyness;
    float s2 = sin(seed.y + uv.y * 3.1415) * uWavyness;

    float x = sign(0.01 - abs(uv.x - 0.5 + s2 + s1));
    return clamp(((1.0 - pow(uv.y, 2.0)) * uv.y) * 2.5 * x, 0.0, 1.0);
}

float layer(vec2 uv, vec2 frequency, vec2 offset, float angle)
{
    pR(uv, angle);
    uv = uv * frequency + offset;
    return scratch(fract(uv), floor(uv));
}

float scratches(vec2 uv)
{
    uv *= uScale;
    uv -= vec2(uOffsetX,uOffsetY);
    vec2 frequency = vec2(uFrequency);
    float scratches = 0.0;
    int iterations = clamp(uLayers,1,20);
    for(int i = 0; i < iterations; ++i)
    {
        float fi = float(i);
    	scratches += layer(uv, frequency, vec2(fi, fi), fi * 3145.0);
        frequency += uFrequencyStep;
    }
    return scratches;
}
void main()
{
    vec2 uv = texCoord.xy-0.5;
    uv.y/=uAspect;

    // using AA by Shane:
    // https://www.shadertoy.com/view/4d3SWf
    // Antialias level. Set to 1 for a standard, aliased scene
    float AA = clamp(uAntiAliasIterations,1.,4.);
    int AA2 = int(AA*AA);
    float color = 0.0;
    vec2 pix = 2.0/vec2(uResWidth,uResHeight)/AA; // or iResolution.xy
    for (int i=0; i<AA2; i++){

        float k = float(i);
        vec2 uvOffs = uv + vec2(floor(k/AA), mod(k, AA)) * pix;
        color += scratches(uvOffs);
    }
    color /= (AA*AA);
    vec4 col = vec4(vec3(color),1.0);
    vec4 base = texture(tex,texCoord);

    outColor = cgl_blend(base,col,amount);;
}
IN vec2 texCoord;
UNI sampler2D tex;
UNI float uOffsetX;
UNI float uOffsetY;
UNI float uZoom;
UNI int uIterations;
UNI int uRandomSeed;
UNI float uSpotEdge;
UNI float uGamma;
UNI float uAspect;
UNI float amount;

{{CGL.BLENDMODES}}

// https://www.shadertoy.com/view/MdfBRX
float Bokeh(vec2 p, vec2 sp, float size, float mi, float blur)
{
    float d = length(p - sp);
    float c = smoothstep(size, size*(1.-blur), d);
    c *= mix(mi, 1., smoothstep(size*.8, size, d));
    return c;
}
///  2 out, 2 in... from https://www.shadertoy.com/view/4djSRW
//stable
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy)*2.0-1.0;

}
vec3 dirt(vec2 uv, float n,float density,float hardness)
{
    n *= density;
    vec2 p = fract(uv * n);
    vec2 st = (floor(uv * n) + 0.5) / n;
    vec2 rnd = hash22(st);
    float c = Bokeh(p, vec2(0.5, 0.5) + vec2(0.3) * rnd, 0.2,
                    abs(rnd.y * 0.35) + 0.3, 0.25 + rnd.x * rnd.y * hardness);

    return vec3(c) * exp(rnd.x * 4.0);
}

void main()
{
	vec3 di = vec3(1.0);
    float edgeHardness = 0.1;
    edgeHardness = clamp(uSpotEdge*0.25,0.0,0.2);

    vec2 uv = (texCoord-0.5);

    uv.y/=uAspect;
    uv *= uZoom;
    uv -= vec2(uOffsetX,uOffsetY);

    int loopSize = clamp(uIterations,0,300);

    float q = 0.0;
    for (int i = 1; i < loopSize; i++)
    {
        q = float(i);
        vec2 h=hash22(vec2(q)+vec2(uRandomSeed));
        di += dirt(uv-h, h.x, 1.0, edgeHardness);
    }

    di = pow(di* 0.01,vec3(uGamma));
    vec4 col = vec4(di,1.0);
    vec4 base = texture(tex,texCoord);

    outColor = cgl_blend(base,col,amount);
}
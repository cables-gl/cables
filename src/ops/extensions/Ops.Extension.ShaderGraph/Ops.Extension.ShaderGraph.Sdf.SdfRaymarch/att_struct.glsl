#define SDF_MAX_DIST 50.
#define SDF_LARGE_NUMBER 1e10

struct SdfShape
{
    vec4 a;
    vec4 b;
    mat4 invM;
    vec4 color;
    float enabled;
};

struct SdfHit
{
    float d;
    vec4 color;
};

mat4 sdfInverse(mat4 m)
{
    if (determinant(m) == 0.) return mat4(1.);
    return inverse(m);
}

SdfHit sdfHit(SdfShape s, float d)
{
    if (s.enabled == 0.) return SdfHit(SDF_LARGE_NUMBER, s.color);
    return SdfHit(d, s.color);
}

SdfHit sdfSmoothUnion(SdfHit a, SdfHit b, float blend)
{
    if (blend <= 0.)
    {
        if (a.d < b.d) return a;
        return b;
    }
    float h = clamp(0.5 + 0.5 * (b.d - a.d) / blend, 0., 1.);
    return SdfHit(mix(b.d, a.d, h) - blend * h * (1. - h), mix(b.color, a.color, h));
}

SdfHit sdfSmoothSubtract(SdfHit a, SdfHit b, float blend)
{
    if (blend <= 0.)
    {
        if (-b.d > a.d) return SdfHit(-b.d, b.color);
        return a;
    }
    float h = clamp(0.5 - 0.5 * (a.d + b.d) / blend, 0., 1.);
    return SdfHit(mix(a.d, -b.d, h) + blend * h * (1. - h), mix(a.color, b.color, h));
}

SdfHit sdfSmoothIntersect(SdfHit a, SdfHit b, float blend)
{
    if (blend <= 0.)
    {
        if (a.d > b.d) return a;
        return b;
    }
    float h = clamp(0.5 - 0.5 * (b.d - a.d) / blend, 0., 1.);
    return SdfHit(mix(b.d, a.d, h) + blend * h * (1. - h), mix(b.color, a.color, h));
}

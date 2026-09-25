vec2 sdfSmoothUnion(vec2 a, vec2 b, float k)
{
    float mat = a.x < b.x ? a.y : b.y;
    if (k <= 0.) return vec2(min(a.x, b.x), mat);
    float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0., 1.);
    return vec2(mix(b.x, a.x, h) - k * h * (1. - h), mat);
}

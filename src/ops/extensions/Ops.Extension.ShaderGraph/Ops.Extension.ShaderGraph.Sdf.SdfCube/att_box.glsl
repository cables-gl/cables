#define sdfBox(size, m, color, enabled) SdfShape(vec4((size) * 0.5, 0.), vec4(0.), sdfInverse(m), (color), (enabled))
#define sdfBoxMap(s, p) sdfHit((s), sdBox((p), (s).a.xyz))

float sdBox(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
}

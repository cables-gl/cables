#define sdfSphere(r, m, color, enabled) SdfShape(vec4((r), 0., 0., 0.), vec4(0.), sdfInverse(m), (color), (enabled))
#define sdfSphereMap(s, p) sdfHit((s), sdSphere((p), (s).a.x))

float sdSphere(vec3 p, float r)
{
    return length(p) - r;
}

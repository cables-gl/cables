SdfShape sdfSphere(float r, mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(r, 0., 0., 0.), vec4(0.), sdfInverse(m), color, enabled);
}

SdfHit sdfSphereMap(SdfShape s, vec3 p)
{
    return sdfHit(s, length(p) - s.a.x);
}

SdfShape sdfCube(vec3 size, mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(size * 0.5, 0.), vec4(0.), sdfInverse(m), color, enabled);
}

SdfHit sdfCubeMap(SdfShape s, vec3 p)
{
    vec3 q = abs(p) - s.a.xyz;
    return sdfHit(s, length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.));
}

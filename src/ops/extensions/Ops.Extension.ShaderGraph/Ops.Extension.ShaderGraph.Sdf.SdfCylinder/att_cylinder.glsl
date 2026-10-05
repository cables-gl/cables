SdfShape sdfCylinder(float radius, float height, mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(radius ,height ,0.,0.), vec4(0.), sdfInverse(m), color, enabled);
}

SdfHit sdfCylinderMap(SdfShape s, vec3 p)
{
    //s.a.xyz
    float r = s.a.x;
    float h = s.a.y;

    vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
    float sdf = min(max(d.x,d.y),0.0) + length(max(d,0.0));
    return sdfHit(s, sdf);
}

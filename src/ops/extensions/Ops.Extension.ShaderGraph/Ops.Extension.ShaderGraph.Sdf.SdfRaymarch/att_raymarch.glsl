SdfHit sdfMap_{{ID}}({{TYPE}} s, vec3 p)
{
    return {{MAP}};
}

vec3 sdfNormal_{{ID}}({{TYPE}} s, vec3 p)
{
    vec2 e = vec2(0.001, 0.);
    return normalize(vec3(
        sdfMap_{{ID}}(s, p + e.xyy).d - sdfMap_{{ID}}(s, p - e.xyy).d,
        sdfMap_{{ID}}(s, p + e.yxy).d - sdfMap_{{ID}}(s, p - e.yxy).d,
        sdfMap_{{ID}}(s, p + e.yyx).d - sdfMap_{{ID}}(s, p - e.yyx).d));
}

vec4 sdfRaymarch_{{ID}}(vec2 uv, {{TYPE}} s, mat4 view, mat4 projection)
{
    mat4 camera = inverse({{VIEW}});
    vec4 target = inverse(projection) * vec4(uv * 2. - 1., -1., 1.);

    vec3 ro = (camera * vec4(0., 0., 0., 1.)).xyz;
    vec3 rd = normalize((camera * vec4(target.xyz / target.w, 0.)).xyz);
    float t = 0.;
    SdfHit h = SdfHit(SDF_LARGE_NUMBER, vec4(0.));

    for (int i = 0; i < 128; i++)
    {
        h = sdfMap_{{ID}}(s, ro + rd * t);
        if (h.d < 0.001 || t > SDF_MAX_DIST) break;
        t += h.d;
    }

    if (h.d >= 0.001) return vec4(0.);

    vec3 n = sdfNormal_{{ID}}(s, ro + rd * t);
    float light = max(dot(n, normalize(vec3(0.6, 0.7, 0.5))), 0.) + 0.15;
    return vec4(h.color.rgb * light, h.color.a);
}

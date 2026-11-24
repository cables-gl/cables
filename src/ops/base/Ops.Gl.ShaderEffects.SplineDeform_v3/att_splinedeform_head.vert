// texture rows: 0 position, 1 tangent, 2 up
vec3 MOD_fetch(int i, int row)
{
    return texelFetch(MOD_tex, ivec2(i, row), 0).xyz;
}

void MOD_frame(float u, out vec3 p, out vec3 t, out vec3 up)
{
    float n = MOD_numPoints;

    #ifdef MOD_LOOP
        u = mod(u, n);
        int i0 = int(min(floor(u), n - 1.0));
        int i1 = int(mod(float(i0) + 1.0, n));
    #else
        u = clamp(u, 0.0, n - 1.0);
        int i0 = int(min(floor(u), n - 2.0));
        int i1 = i0 + 1;
    #endif

    float f = u - float(i0);
    p = mix(MOD_fetch(i0, 0), MOD_fetch(i1, 0), f);
    t = normalize(mix(MOD_fetch(i0, 1), MOD_fetch(i1, 1), f));
    up = mix(MOD_fetch(i0, 2), MOD_fetch(i1, 2), f);
    up = normalize(up - t * dot(up, t));
}

SdfShape sdfMenger(float scale,float scale_factor,float wrap, float iter,mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(scale,scale_factor,wrap, iter), vec4(0.), sdfInverse(m), color, enabled);
}

float cross_inf(vec3 p,float scale, float wrap){
    float a = wrap;
    p = mod(p.xyz-a/2.,a)-a/2.;
    float s = 1./scale;
    float da = max (abs(p.x), abs(p.y));
    float db = max (abs(p.y), abs(p.z));
    float dc = max (abs(p.z), abs(p.x));
    return min(da,min(db,dc)) - s;
}

SdfHit sdfMengerMap(SdfShape s, vec3 p0)
{
    vec3 size = vec3(1.);
    vec3 d = abs(p0) - size;
    float sdf = max(max(d.x, d.y), d.z);

    float scale = s.a.x;
    float scale_factor = s.a.y;
    float wrap = s.a.z;

    int iter = int(s.a.w);

    float cross_scale = 1.;
    for(int i = 0; i < iter; i++){

        sdf = max(sdf,-cross_inf(p0*cross_scale,scale,wrap)/cross_scale);
        cross_scale *= scale_factor;
    }


    return sdfHit(s, sdf);
}

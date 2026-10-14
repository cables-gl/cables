SdfShape sdfKIFS2(vec3 sp, vec2 yp, float scale, float iter, mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(sp, 0.), vec4(yp,scale,iter), sdfInverse(m), color, enabled);
}

vec3 ref_opt(vec3 p, vec3 pos, vec3 n){
    return p - 2.0 * min(0.0, dot(p - pos, n)) * n;
}

vec3 yp(vec2 yp){

    float y = yp.x;
    float p = yp.y;
    return vec3(cos(y) * cos(p), sin(y) * cos(p), sin(p));
}


SdfHit sdfKIFS2Map(SdfShape s, vec3 p)
{
	vec3 n0 = yp(s.b.xy*3.);
	vec3 n1 = yp(s.b.xy*1.);
	vec3 n2 = yp(s.b.xy*4.);
	vec3 n3 = yp(s.b.xy*2.);

	vec3 v0 = s.a.xyz*1.;
	vec3 v1 = s.a.xyz*2.;
	vec3 v2 = -s.a.xyz*1.;
	vec3 v3 = -s.a.xyz*2.;

    float scale = s.b.z;
    int iter = int(s.b.w);
    float s_fac = 1.0;
    float col = 0.0;

    for(int i = 0; i < iter; i++) {
        p = ref_opt(p, v0, n0);
        p = ref_opt(p, v1, n1);
        p = ref_opt(p, v2, n2);
        p = ref_opt(p, v3, n3);

        p *= scale;
        s_fac *= scale;

        col += length(p) / s_fac - 10.0 / s_fac;
    }
    float sdf = (length(p) - 10.0) / s_fac;

    return sdfHit(s, sdf);
}

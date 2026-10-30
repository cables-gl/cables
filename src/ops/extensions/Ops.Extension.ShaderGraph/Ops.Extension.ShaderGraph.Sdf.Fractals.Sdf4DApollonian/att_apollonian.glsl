SdfShape sdfApollonian(float scale, vec3 rot, vec3 trans, float iter, mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(scale, rot), vec4(trans,iter), sdfInverse(m), color, enabled);
}


vec4 rotate_4D(vec4 v, vec3 rot){
    v = vec4(v.x,v.y, v.w*sin(rot.x) + v.z*cos(rot.x), v.w*cos(rot.x) - v.z*sin(rot.x) );
    v = vec4(v.x,v.y*cos(rot.y) + v.w*sin(rot.y), v.z, -v.y*sin(rot.y) + v.w*cos(rot.y) );
    v = vec4(v.y*sin(rot.z) + v.x*cos(rot.z), v.y*cos(rot.z) - v.x*sin(rot.z),v.z,v.w );
    return v;
}


SdfHit sdfApollonianMap(SdfShape s, vec3 p0)
{
    float scale = s.a.x;
    vec3 rot = s.a.yzw;

    int iter = int(s.b.w);
    vec3 trans = s.b.xyz;

    vec4 p = vec4(p0, 0.);
    p = rotate_4D(p , rot);
    p.yzw -= trans;

    float sc = 1.;
    for(int i = 0; i < iter; i++){
        p = mod(p-1.,2.)-1.;
        float inv = scale/dot(p,p);
        p*=inv;
        sc*=inv;
    }

    float sdf = (length(p/sc)*0.25);

    return sdfHit(s,  sdf);
}


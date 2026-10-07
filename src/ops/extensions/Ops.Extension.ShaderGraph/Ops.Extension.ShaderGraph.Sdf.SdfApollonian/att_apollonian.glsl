SdfShape sdfApollonian(float scale, vec3 wrap, float iter, mat4 m, vec4 color, float enabled)
{
    return SdfShape(vec4(scale, wrap), vec4(iter,0.,0.,0.), sdfInverse(m), color, enabled);
}

SdfHit sdfApollonianMap(SdfShape s, vec3 p0)
{
    float scale = s.a.x;
    vec3 wrap = s.a.yzw;

    float x = wrap.x;
    float y = wrap.y;
    float z = wrap.z;

    vec4 p = vec4(p0, 1.);

    int iter = int(s.b.x);

    for(int i = 0; i < iter; i++){

      p.x = mod(p.x-x/2.,x)-x/2.;
      p.y = mod(p.y-y/2.,y)-y/2.;
      p.z = mod(p.z-z/2.,z)-z/2.;

      p*=(scale)/dot(p.xyz,p.xyz);
    }
    float sdf = (length(p.xyz/p.w)*0.25);

    return sdfHit(s,  sdf);
}

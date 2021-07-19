IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;

UNI float seed;

UNI float rmin;
UNI float rmax;
UNI float gmin;
UNI float gmax;
UNI float bmin;
UNI float bmax;

{{CGL.BLENDMODES}}
{{MODULES_HEAD}}

{{CGL.RANDOM_TEX}}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}


void main()
{
    vec4 rnd=vec4((cgl_random3(texCoord.xy + vec2(seed))), 1.0);

    rnd.r=map(rnd.x, 0., 1., rmin, rmax);
    rnd.y=map(rnd.y, 0., 1., gmin, gmax);
    rnd.z=map(rnd.z, 0., 1., bmin, bmax);
    rnd.a=1.0;

    // vec4 base¿=texture(tex,texCoord);
    // vec4 col¿=vec4( _blend(base.rgb,rnd.rgb) ,1.0);

    // outColor=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor=rnd;
}
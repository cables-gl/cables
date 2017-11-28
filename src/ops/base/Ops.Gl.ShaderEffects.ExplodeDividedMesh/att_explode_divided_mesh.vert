UNI float MOD_dist;

UNI float MOD_x;
UNI float MOD_y;
UNI float MOD_z;

UNI float MOD_posx;
UNI float MOD_posy;
UNI float MOD_posz;
UNI float MOD_size;

UNI float MOD_mulx;
UNI float MOD_muly;
UNI float MOD_mulz;

float MOD_rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 MOD_deform(vec4 pos,vec3 normal,float index)
{
    index=floor(index/3.0);

    vec4 p=abs(pos);
    p.x+=MOD_x+0.01;
    p.y+=MOD_y+0.01;
    p.z+=MOD_z+0.01;
    
    vec4 pp=vec4(normal*(MOD_rand(vec2(index)) * MOD_dist-MOD_dist/2.0),1.0) * p;
    
    #ifdef ABSOLUTE
        pp=abs(pp);
    #endif

    pp.x*=MOD_mulx;
    pp.y*=MOD_muly;
    pp.z*=MOD_mulz;
    
    
    float MOD_falloff=0.2;
    float distMul=distance(vec3(MOD_posx,MOD_posy,MOD_posz),pos.xyz);
    distMul=1.0-smoothstep(MOD_falloff*MOD_size,MOD_size,distMul);

    
    
    pos.xyz += distMul*pp.xyz;
    
    return pos;
}

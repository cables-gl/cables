
UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_size;

vec4 MOD_scaler(vec4 pos,vec4 worldPos,vec3 normal)
{
    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 vecToOrigin=worldPos.xyz-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) ;

    if(MOD_smooth) distAlpha=smoothstep(0.0,MOD_size,distAlpha);

    float m=(distAlpha*MOD_strength);

    #ifndef MOD_TO_ZERO
        m+=1.0;
    #endif

    // if(m<0.0)m=0.0;

    pos.xyz*=m;

    return pos;
}

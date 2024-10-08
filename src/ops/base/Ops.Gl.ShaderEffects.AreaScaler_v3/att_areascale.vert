
vec4 MOD_scaler(vec4 pos,vec4 worldPos,vec3 normal,mat4 mMatrix)
{
    vec3 forcePos = vec3(MOD_x,MOD_y,MOD_z);

    #ifdef MOD_OBJECT_POS
        worldPos=mMatrix*vec4(0.0,0.0,0.0,1.0);
    #endif

    vec3 vecToOrigin = worldPos.xyz-forcePos;

    float dist = abs(length(vecToOrigin)) ;


    float distAlpha = (MOD_size - dist) ;

    if(MOD_smooth) distAlpha = smoothstep(0.0,MOD_size,distAlpha);

    float m = distAlpha * MOD_strength;

    #ifdef MOD_TO_ZERO
        m+=1.0;
    #endif

    if(m<0.0)m=0.0;

    #ifdef MOD_CLAMP_SIZE
        pos.xyz*=clamp(m,MOD_clampMin,MOD_clampMax);
    #else
        pos.xyz*=m ;
    #endif

    return pos;
}

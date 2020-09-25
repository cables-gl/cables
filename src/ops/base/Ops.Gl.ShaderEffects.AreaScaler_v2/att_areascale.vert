UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_falloff;
UNI float MOD_size;
UNI float MOD_clampMin,MOD_clampMax;

vec4 MOD_scaler(vec4 pos,vec4 worldPos,vec3 normal,mat4 mMatrix)
{
    vec3 forcePos = vec3(MOD_x,MOD_y,MOD_z);
    float fallOff =MOD_falloff*4.;

    #ifdef MOD_OBJECT_POS
        worldPos=mMatrix*vec4(0.0,0.0,0.0,1.0);
    #endif

    vec3 vecToOrigin = worldPos.xyz-forcePos;
    float dist = 0.;

    #ifdef MOD_DISTANCE
    //cool but what
    // dist = abs(length(vecToOrigin))* distance(worldPos.xyz,forcePos) ;
        dist = abs(length(vecToOrigin)) ;

    #endif

    #ifdef MOD_SCALAR
        // dist = abs(length(vecToOrigin)) * smoothstep(MOD_size*MOD_falloff,MOD_falloff,pos.x);//smoothstep()
        dist = abs(length(vecToOrigin));
        dist = abs(length(vecToOrigin)) * smoothstep(MOD_size*fallOff,fallOff,dist);
    #endif

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

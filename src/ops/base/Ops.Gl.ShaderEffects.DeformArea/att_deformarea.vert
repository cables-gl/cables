vec4 MOD_deform(vec4 pos,mat4 mMatrix)
{
    vec4 modelPos=pos;

    #ifdef MOD_WORLDSPACE
       modelPos=mMatrix*pos;
    #endif

    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 vecToOrigin=modelPos.xyz-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) / MOD_size;

    if(MOD_size > dist)
    {
        vec3 vecNormal=normalize(vecToOrigin);

        if(MOD_smooth>0.0) distAlpha=smoothstep(0.0,MOD_size,distAlpha);

        vec3 velocity = (vecNormal * distAlpha * MOD_strength );

        pos.xyz+=velocity*0.1;
    }

    return pos;

}

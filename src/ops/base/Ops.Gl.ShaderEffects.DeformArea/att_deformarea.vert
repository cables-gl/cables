
UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_size;

vec4 MOD_deform(vec4 pos)
{
    // vec3 MOD_pos=vec3();
    vec4 modelPos=pos;
    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 vecToOrigin=modelPos.xyz-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) / MOD_size;

    if(MOD_size > dist)
    {
        vec3 vecNormal=normalize(vecToOrigin);

        if(MOD_smooth) distAlpha=smoothstep(0.0,MOD_size,distAlpha);

        vec3 velocity = (vecNormal * distAlpha * MOD_strength );

        pos.xyz+=velocity*0.1;
    }    
    // else pos.xyz*=0.01;
    
    return pos;

}

for(int i=0;i<NUM_FORCES;i++)
{
    if(forces[i].attraction==0.0)continue;

    vec4 modelPos=modelMatrix*pos;

    vec3 vecToOrigin=modelPos.xyz-forces[i].pos;
    float dist=abs(length(vecToOrigin));

    float distAlpha = (forces[i].range - dist) / forces[i].range;

    if(forces[i].range > dist)
    {
        vec3 vecNormal=normalize(vecToOrigin);

        if(MOD_smooth) distAlpha=smoothstep(0.0,forces[i].range,distAlpha);

        vec3 velocity = (vecNormal * distAlpha * forces[i].attraction );



        pos.xyz+=velocity*0.1;
    }
}

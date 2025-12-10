bool respawn=false;
// respawn


// respawn=(attrVertIndex> MOD_spawnFrom && attrVertIndex<MOD_spawnTo);

if(attrVertIndex> MOD_spawnFrom && attrVertIndex<MOD_spawnTo)
{
    respawn=true;
}


// float respawn=(1.0-step(MOD_spawnFrom,attrVertIndex))*
    // (step(MOD_spawnTo,attrVertIndex));


// if(!respawn)
{
// calculate position...

    col=rndpos+0.5;
    
    // bool respawn=false;
    vec3 velocity=vec3(0.0);
    
    for(int i=0;i<NUM_FORCES;i++)
    {
        if(forces[i].time<MOD_time)continue;
    
        vec3 vecToOrigin=inPos-forces[i].pos;
        float dist=abs(length(vecToOrigin));
    
        if(forces[i].range > dist)
        {
            // velocity=vec3(11.0,11.0,11.0);
    
            float distAlpha = (forces[i].range - dist) / forces[i].range;
    
            // if (abs(distAlpha) > 0.98)
            // {
                // respawn=true;
            // }
    
            vec3 vecNormal=normalize(vecToOrigin);
    
            velocity += (vecNormal * distAlpha * forces[i].attraction )*MOD_timeDiff;
    
            vec3 tangentForce=vec3(
                vecNormal.y,
                -vecNormal.x,
                -vecNormal.z
                );
    
            float f=distAlpha * forces[i].angle;
    
            velocity+=(tangentForce*f)*MOD_timeDiff;
    
        }
    }
    
    outLife=life;
    
    if(MOD_time-life.x>MOD_lifeTime)
    {
        outLife.x=MOD_time;
        // respawn=;
    }
    

    outPos=inPos+velocity;

    #ifdef POINTMATERIAL
        float lifeElapsed=(MOD_time-life.x)/MOD_lifeTime;
        sizeMultiply *= smoothstep(0.0, MOD_fadeinout, lifeElapsed) * (1.0 - smoothstep(1.0-MOD_fadeinout, 1.0, lifeElapsed));
    #endif

    
}

if(respawn)
{

    outPos=(
        2.0*vec3(
        (random(vec2(MOD_time+rndpos.y,rndpos.x))-0.5),
        (random(vec2(MOD_time+rndpos.z,rndpos.x))-0.5),
        (random(vec2(rndpos.x,MOD_time+rndpos.z))-0.5)
        ));

    outPos.x*=MOD_sizeX;
    outPos.y*=MOD_sizeY;
    outPos.z*=MOD_sizeZ;
    outPos+=MOD_emitterPos;
    
    #ifdef POINTMATERIAL
        sizeMultiply =0.0;
    #endif

}

pos=vec4(outPos,1.0);

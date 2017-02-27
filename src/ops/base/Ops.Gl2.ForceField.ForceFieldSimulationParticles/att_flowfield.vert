



col=rndpos+0.5;

// vec3.add(this.pos,this.pos,this.velocity);
bool respawn=false;
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

        if (abs(distAlpha) > 0.98)
        {
            // respawn=true;
        }
        // distAlpha = distAlpha * distAlpha;
        //
        // if (distAlpha > 0.92)
        // {
        //     // If particle is too close to origin then kill it
        //     this.spawn();
        //     dieNear++;
        // }
        // else
        // {
        //     vec3.normalize(vecNormal,vecToOrigin);

        vec3 vecNormal=normalize(vecToOrigin);

        //     vec3.copy(vecForce,vecNormal);


        //     var vf=force.attraction;

        //     vec3.mul(vecForce,vecForce,vec3.fromValues(vf*distAlpha,vf*distAlpha,vf*distAlpha));
        //     vec3.add(this.velocity,this.velocity,vecForce);
        velocity += (vecNormal * distAlpha * forces[i].attraction )*MOD_timeDiff;

        vec3 tangentForce=vec3(
            vecNormal.y,
            -vecNormal.x,
            -vecNormal.z
            );
        //
        //     // // Apply spin force
        //     this.tangentForce[0]=vecNormal[1];
        //     this.tangentForce[1]=-vecNormal[0];
        //     this.tangentForce[2]=-vecNormal[2];
        //
        //     var f=distAlpha * force.angle;
        float f=distAlpha * forces[i].angle;

        velocity+=(tangentForce*f)*MOD_timeDiff;
        //     vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(f,f,f));
        //     vec3.add(this.velocity,this.velocity,this.tangentForce);
        // }

    }
}

respawn=false;

if(MOD_time>life.x)
{
    // outPos+=0.1;
    // respawn=true;
    outLife.x=MOD_time+10.0;
}


// if(respawn)
// {
//     // outLife.x=MOD_time+10.0;
//     // outLife.y=MOD_time+10.0;
//     // outLife.z=MOD_time+10.0;
//
//     outPos=2.0*vec3(
//         (random(vec2(MOD_time+rndpos.y,rndpos.x))-0.5),
//         (random(vec2(MOD_time+rndpos.z,rndpos.x))-0.5),
//         (random(vec2(rndpos.x,MOD_time+rndpos.z))-0.5)
//         );
//     outPos*=MOD_size/2.0;
//     outPos+=MOD_emitterPos;
//     // outPos.z=0.0;
// }
// else
{
    outPos=inPos+velocity;
    // outPos.z=0.0;
    outPos.z=life.x;
}



// psMul*=timeOffset;

// gl_PointSize=pointSize;
pos=vec4(outPos,1.0);

// psMul*=timeOffset;

// gl_PointSize=pointSize;

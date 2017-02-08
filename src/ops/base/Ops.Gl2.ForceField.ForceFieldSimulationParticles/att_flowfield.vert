

col=rndpos+0.5;

// vec3.add(this.pos,this.pos,this.velocity);
bool respawn=false;
vec3 velocity=vec3(0.0);

for(int i=0;i<NUM_FORCES;i++)
{
    if(forces[i].time<{{mod}}time)continue;

    vec3 vecToOrigin=vPosition-forces[i].pos;
    float dist=abs(length(vecToOrigin));

    if(forces[i].range > dist)
    {
        // velocity=vec3(11.0,11.0,11.0);

        float distAlpha = (forces[i].range - dist) / forces[i].range;

        if (abs(distAlpha) > 0.98)
        {
            respawn=true;
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
        velocity += (vecNormal * distAlpha * forces[i].attraction / 1000.0)*{{mod}}timeDiff;

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
        float f=distAlpha * forces[i].angle/1000.0;

        velocity+=(tangentForce*f)*{{mod}}timeDiff;
        //     vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(f,f,f));
        //     vec3.add(this.velocity,this.velocity,this.tangentForce);
        // }

    }

}

if(respawn)
{
    outPos=2.0*vec3(
        (random(vec2({{mod}}time+rndpos.y,rndpos.x))-0.5),
        (random(vec2({{mod}}time+rndpos.z,rndpos.x))-0.5),
        (random(vec2(rndpos.x,{{mod}}time+rndpos.z))-0.5)
        );
        outPos*={{mod}}size;
        outPos+={{mod}}emitterPos;
    // outPos.z=0.0;
}
else
{
    outPos=vPosition+velocity;
    // outPos.z=0.0;
}

// gl_PointSize=pointSize;

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

//         //     vec3.copy(vecForce,vecNormal);
//         //     var vf=force.attraction;

        // vec3.mul(vecForce,vecForce,vec3.fromValues(vf*distAlpha,vf*distAlpha,vf*distAlpha));
        // vec3.add(vel,this.velocity,vecForce);
        vec3 velocity = (vecNormal * distAlpha * forces[i].attraction );

        // pos.xyz+=distAlpha;
        pos.xyz+=velocity*0.1;
    }

}


// col=rndpos+0.5;

// // vec3.add(this.pos,this.pos,this.velocity);
// bool respawn=false;
// vec3 velocity=vec3(0.0);

// for(int i=0;i<NUM_FORCES;i++)
// {
//     if(forces[i].time<MOD_time)continue;

//     vec3 vecToOrigin=inPos-forces[i].pos;
//     float dist=abs(length(vecToOrigin));

//     if(forces[i].range > dist)
//     {
//         // velocity=vec3(11.0,11.0,11.0);

//         float distAlpha = (forces[i].range - dist) / forces[i].range;

//         if (abs(distAlpha) > 0.98)
//         {
//             // respawn=true;
//         }
//         // distAlpha = distAlpha * distAlpha;
//         //
//         // if (distAlpha > 0.92)
//         // {
//         //     // If particle is too close to origin then kill it
//         //     this.spawn();
//         //     dieNear++;
//         // }
//         // else
//         // {
//         //     vec3.normalize(vecNormal,vecToOrigin);

//         vec3 vecNormal=normalize(vecToOrigin);

//         //     vec3.copy(vecForce,vecNormal);


//         //     var vf=force.attraction;

//         //     vec3.mul(vecForce,vecForce,vec3.fromValues(vf*distAlpha,vf*distAlpha,vf*distAlpha));
//         //     vec3.add(this.velocity,this.velocity,vecForce);
//         velocity += (vecNormal * distAlpha * forces[i].attraction )*MOD_timeDiff;

//         vec3 tangentForce=vec3(
//             vecNormal.y,
//             -vecNormal.x,
//             -vecNormal.z
//             );
//         //
//         //     // // Apply spin force
//         //     this.tangentForce[0]=vecNormal[1];
//         //     this.tangentForce[1]=-vecNormal[0];
//         //     this.tangentForce[2]=-vecNormal[2];
//         //
//         //     var f=distAlpha * force.angle;
//         float f=distAlpha * forces[i].angle;

//         velocity+=(tangentForce*f)*MOD_timeDiff;
//         //     vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(f,f,f));
//         //     vec3.add(this.velocity,this.velocity,this.tangentForce);
//         // }

//     }
// }

// respawn=false;

// // if(MOD_time>life.x)
// // {
// //     // outPos+=0.1;
// //     // respawn=true;
// //     outLife.x=life.x+0.1;
// // }
// //
// // if(length(inPos)>100.0) respawn=true;
// //
// // if(life.x>10.0) respawn=true;

// outLife=life;


// if(MOD_time-life.x>MOD_lifeTime)
// {
//     outLife.x=MOD_time;
//     respawn=true;
// }

// #ifdef POINTMATERIAL

//     float lifeElapsed=(MOD_time-life.x)/MOD_lifeTime;

//     sizeMultiply *= smoothstep(0.0, MOD_fadeinout, lifeElapsed) * (1.0 - smoothstep(1.0-MOD_fadeinout, 1.0, lifeElapsed));


//     // psMul=smoothstep(0.0,1.0,min(1.0,psMul));

// #endif




// if(respawn)
// {
//     outPos=2.0*vec3(
//         (random(vec2(MOD_time+rndpos.y,rndpos.x))-0.5),
//         (random(vec2(MOD_time+rndpos.z,rndpos.x))-0.5),
//         (random(vec2(rndpos.x,MOD_time+rndpos.z))-0.5)
//         );

//     outPos.x*=MOD_sizeX/2.0;
//     outPos.y*=MOD_sizeY/2.0;
//     outPos.z*=MOD_sizeZ/2.0;
//     outPos+=MOD_emitterPos;
// }
// else
// {
//     outPos=inPos+velocity;
// }


// // outPos.z=life.x;


// // psMul*=timeOffset;

// // gl_PointSize=pointSize;
// pos=vec4(outPos,1.0);

// // psMul*=timeOffset;

// // gl_PointSize=pointSize;

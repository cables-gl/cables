
#define blablub in

in vec3 vPosition;
in float attrVertIndex;
blablub vec3 rndpos;
out vec3 col;
uniform float pointSize;
uniform float time;

struct Force
    {
        vec3 pos;
        float attraction;
        float angle;
        float range;
    };


#define NUM_FORCES 4
// force forces[NUM_FORCES];
uniform Force forces[NUM_FORCES];



out vec3 outPos;

uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;



float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


void main()
{
    // force.range=22;
    // force.attraction=0.001;
    // force.angle=0.02;
    // force.pos=vec3.fromValues(0,0,0);

    // forces[0].range=2.5;
    // forces[0].attraction=0.00001;
    // forces[0].angle=0.002;
    // forces[0].pos=vec3(0.0);
    //
    //
    // forces[1].range=0.55;
    // forces[1].attraction=-0.01;
    // forces[1].angle=-0.02;
    // forces[1].pos=vec3(0.2,0.2,0.2);
    //
    // forces[2].range=0.2;
    // forces[2].attraction=-0.001;
    // forces[2].angle=-0.03;
    // forces[2].pos=vec3(-0.4,-0.2,0.0);

   //
   // force.range=Math.random()*size/3+size/10;
   // force.attraction=Math.random()*0.1;
   // force.angle=Math.random()*0.1;
   // force.pos=vec3.fromValues(rndPos(),rndPos(),0);


col=rndpos+0.5;

   // vec3.add(this.pos,this.pos,this.velocity);
   bool respawn=false;
   vec3 velocity=vec3(0.0);

    for(int i=0;i<NUM_FORCES;i++)
    {
        vec3 vecToOrigin=vPosition-forces[i].pos;
        float dist=abs(length(vecToOrigin));

        if(forces[i].range > dist)
        {
            // velocity=vec3(11.0,11.0,11.0);

            float distAlpha = (forces[i].range - dist) / forces[i].range;


            if (abs(distAlpha) > 0.9)
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
            velocity += vecNormal * distAlpha * forces[i].attraction / 1000.0;

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

            velocity+=tangentForce*f;
            //     vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(f,f,f));
            //     vec3.add(this.velocity,this.velocity,this.tangentForce);
            // }

        }

    }

    if(respawn)
    {
        outPos=2.0*vec3(
            random(vec2(time+rndpos.y,rndpos.x))-0.5,
            random(vec2(time+rndpos.z,rndpos.x))-0.5,
            random(vec2(rndpos.x,time+rndpos.z))-0.5
            );
        // outPos.z=0.0;
    }
    else
    {
        outPos=vPosition+velocity;
    }

    gl_PointSize=pointSize;
    gl_Position = projMatrix * modelMatrix *  viewMatrix * vec4(vPosition,1.0);
}

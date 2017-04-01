op.name="ForceFieldSimulationLines";

var exec=op.inFunction("exec");
var next=op.outFunction("next");

var numParticles=op.inValueInt("Num Particles",100);

var inReset=op.inFunction("Reset");
var inRespawn=op.inFunction("Respawn all");
var inSpeed=op.inValue("Speed",1);
var inDamping=op.inValue("Damping");

var col=op.outValue("color");

var triggerForce=op.outFunction("force");
var inSize=op.inValue("Size Area");

var outOffset=op.outValue("offset");
var outIndex=op.outValue("Index");
var outPoints=op.outArray("Points");

var outDieSlow=op.outValue("Die Slow");


var numLinePoints=op.inValueInt("Num Line Points",100);

var minLifetime=op.inValueInt("Min LifeTime",5);
var maxLifetime=op.inValueInt("Max LifeTime",5);

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");


var size=140;
var particles=[];
var damping=vec3.fromValues(0.8,0.8,0.8);

var dieOffArea=0;
var dieSlow=0;
var dieNear=0;

inRespawn.onTriggered=respawnAll;
var cgl=op.patch.cgl;
inReset.onTriggered=reset;

inSize.onChange=function()
{
    size=inSize.get();
    reset();
};

inDamping.onChange=function()
{
    damping[0]=damping[1]=damping[2]=inDamping.get();
};

numParticles.onChange=respawnAll;
numLinePoints.onChange=respawnAll;


function respawnAll()
{
    particles.length=0;
    for(var i=0;i<numParticles.get();i++)
    {
        var p=new Particle();    
        p.spawn();
        particles[i]=p;
    }
}


function reset()
{
    if(particles.length==0)
    {
        respawnAll();
    }
    else
    {
        for(var i=0;i<numParticles.get();i++)
        {
            particles[i].spawn();
        }
    }
}

function rndPos(s)
{
    if(!s)s=size;
    return Math.random()*s-s/2;
}


var Particle=function()
{
    this.pos=vec3.create();
    this.oldPos=vec3.create();
    this.velocity=vec3.create();
    this.tangentForce=vec3.create();
    this.idleFrames=0;
    // this.points=[];
    this.speed=0;
    
    this.buff=new Float32Array(3*Math.floor(numLinePoints.get()));
    this.spawn();
};

Particle.prototype.spawn=function()
{
    this.idleFrames=0;
    this.pos[0]=Math.random()*size-size/2;
    this.pos[1]=Math.random()*size-size/2;
    this.pos[2]=Math.random()*size-size/2;
    
    this.pos[0]+=posX.get();
    this.pos[1]+=posY.get();
    this.pos[2]+=posZ.get();
    // this.oldPos[2]=this.pos[2]=Math.random()*size-size/2;
    
    // for(var i=0;i<this.points.length;i++)
    // this.points.length=0;
    
    // this.oldPos[0]=Math.round( this.oldPos[0]/153 )*153;
    // this.oldPos[1]=Math.round( this.oldPos[1]/153 )*153;
    // this.oldPos[2]=Math.round( this.oldPos[2]/153 )*153;
    

    for(var i=0;i<this.buff.length;i+=3)
    {
        this.buff[i+0]=this.pos[0];
        this.buff[i+1]=this.pos[1];
        this.buff[i+2]=this.pos[2];
    }
    this.rnd=Math.random();
    this.startTime=Date.now();

    this.endTime=
        Date.now()+
        (
            (
                (maxLifetime.get()-minLifetime.get()) + minLifetime.get()
            )*1000 
        );

    this.lifetime=0;
};




function vecLimit(v,max)
{
    if (vec3.sqrLen(v) > max*max)
    {
        vec3.normalize(v,v);
        vec3.mul(v,v,vec3.fromValues(max,max,max));
    }
}

var vecLength=vec3.create();

Particle.prototype.update=function(forces)
{
    this.velocity[0]=0;
    this.velocity[1]=0;
    this.velocity[2]=0;
    // Update position
    vec3.copy(this.oldPos,this.pos);
    if(Date.now()>this.endTime)
    {
        this.spawn();
        return;
    }
    this.lifetime=Date.now()-this.startTime;
    
    for(var i=0;i<CABLES.forceFieldForces.length;i++)
    {
        this.apply(CABLES.forceFieldForces[i]);
    }
    

    // var speed=timeDiff*inSpeed.get();
    // this.velocity[0]*=speed;
    // this.velocity[1]*=speed;
    // this.velocity[2]*=speed;
    
    // vec3.mul(this.velocity,this.velocity,speed);


    vecLimit(this.velocity,inSpeed.get());
    
    vec3.add(this.pos,this.pos,this.velocity);



    // Get particle speed
    vec3.sub(vecLength,this.oldPos,this.pos);
    this.speed = vec3.len(vecLength);

    if (this.speed < 0.005)
    {
        // Particle is pretty stationary
        this.idleFrames++;
      
        // Should we kill it yet?
        if (this.idleFrames > 100)
        {
            dieSlow++;
            
            // console.log('die faul');
            this.spawn();
        }
    }
    else
    {
      // How far is particle from center of screen
    //   PVector vecDistance = new PVector(512/2, 512/2, 0);
    //   vecDistance.sub(m_vecPos);
    //   if(vecDistance.mag() > (512 * 2))
        if(vec3.len(this.pos)>1000)
        {
            // Too far off screen - kill it
            dieOffArea++;
            this.spawn();
            // console.log("die off");
        }
    }

    // vec3.mul(this.velocity,this.velocity,speed);
};

var vecToOrigin=vec3.create();
var vecNormal=vec3.create();
var vecForce=vec3.create();

Particle.prototype.apply=function(force)
{
    // Are we close enough to be influenced?
    vec3.sub(vecToOrigin,this.pos,force.pos);
    var dist = vec3.len(vecToOrigin);
    
    if (dist < force.range)
    {
        var distAlpha = (force.range - dist) / force.range;
        distAlpha = distAlpha * distAlpha;
        
        if (distAlpha > 0.92)
        {
            // If particle is too close to origin then kill it
            this.spawn();
            dieNear++;
        }
        else
        {
            vec3.normalize(vecNormal,vecToOrigin);
            vec3.copy(vecForce,vecNormal);
            // this.velocity[0]=0;
            // this.velocity[1]=0;
            // this.velocity[2]=0;

            vec3.mul(vecForce,vecForce,vec3.fromValues(
                force.attraction * distAlpha*timeDiff,
                force.attraction * distAlpha*timeDiff,
                force.attraction * distAlpha*timeDiff));
            vec3.add(this.velocity,this.velocity,vecForce);

            // // Apply spin force
            this.tangentForce[0]=vecNormal[1];
            this.tangentForce[1]=-vecNormal[0];
            this.tangentForce[2]=-vecNormal[2];
            
            // this.velocity[0]+=0.08;

            var f=distAlpha * force.angle;
            vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(
                f*timeDiff,
                f*timeDiff,
                f*timeDiff));
            
            
            vec3.add(this.velocity,this.velocity,this.tangentForce);
        }
    }
};





var vec=vec3.create();
var lastTime=0;
var timeDiff=0;
exec.onTriggered=function()
{
    var time=op.patch.freeTimer.get();
    timeDiff=(time-lastTime)*inSpeed.get();

    
    outDieSlow.set(dieSlow);
    
    dieOffArea=0;
    dieSlow=0;
    dieNear=0;

    for(var j=0;j<CABLES.forceFieldForces.length;j++)
    {
        cgl.pushMvMatrix();
        vec3.set(vec, CABLES.forceFieldForces[j].pos[0],CABLES.forceFieldForces[j].pos[1],CABLES.forceFieldForces[j].pos[2]);
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

        // outSpeed.set(p.speed/maxSpeed);

        triggerForce.trigger();
        cgl.popMvMatrix();
    }

    for(var i=0;i<particles.length;i++)
    {
        var p=particles[i];
        p.update(CABLES.forceFieldForces);
        // outSpeed.set(p.speed/maxSpeed);
        
        var ppos=Math.abs( (p.pos[0]) );
        var lifetimeMul=Math.min(p.lifetime/3000,1);

        arrayWriteToEnd(p.buff,p.pos[0])
        arrayWriteToEnd(p.buff,p.pos[1])
        arrayWriteToEnd(p.buff,p.pos[2])
        // arrayWriteToEnd(p.buff,vec3.len(p.velocity)*20*lifetimeMul)

        col.set(ppos);
        outIndex.set(i);
        outPoints.set(p.buff);

        next.trigger();
        lastTime=time;
    }

    

};



reset();
op.name="FluidSimTest";

var exec=op.inFunction("exec");
var next=op.outFunction("next");

var inReset=op.inFunction("Reset");
var inRespawn=op.inFunction("Respawn all");
var inDamping=op.inValue("Damping");

var outSpeed=op.outValue("Speed");
var col=op.outValue("color");

var triggerForce=op.outFunction("force");


var outOffset=op.outValue("offset");
var outIndex=op.outValue("Index");
var outPoints=op.outArray("Points");

var outDieSlow=op.outValue("Die Slow");


var numParticles=1000;

var size=10;
var forces=[];
var particles=[];
var damping=vec3.fromValues(0.8,0.8,0.8);
var maxSpeed=5.04252;

var dieOffArea=0;
var dieSlow=0;
var dieNear=0;

inRespawn.onTriggered=respawnAll;
var cgl=op.patch.cgl;
inReset.onTriggered=reset;

inDamping.onChange=function()
{
    damping[0]=damping[1]=damping[2]=inDamping.get();
};

function respawnAll()
{
    particles.length=0;
    for(var i=0;i<numParticles;i++)
    {
        var p=new Particle();    
        p.spawn();
        particles.push(p);
    }
}


function reset()
{
    forces.length=0;
    var force=new Force();
    forces.push(force);
    force.range=22;
    force.maxAttractForce=0.001;
    force.maxAngleForce=0.02;
    force.pos=vec3.fromValues(0,0,0);
    
    
    for(var i=0;i<8;i++)
    {
        var force=new Force();
        forces.push(force);
        force.range=Math.random()*size/3+size/10;
        force.maxAttractForce=Math.random()*0.1;
        force.maxAngleForce=Math.random()*0.1;
        force.pos=vec3.fromValues(rndPos(),rndPos(),0);
    }
    
    if(particles.length==0)
    {
        respawnAll();
    }
    else
    {
        for(var i=0;i<numParticles;i++)
        {
            
            particles[i].spawn();
        }
    }
}

var Force=function()
{
    this.range=200;
    this.maxAttractForce=-0.1;
    this.maxAngleForce=0.1;
    this.pos=vec3.create();
};

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
    this.points=[];
    this.speed=0;
    
    this.buff=new Float32Array(360);
};

Particle.prototype.spawn=function()
{
    this.idleFrames=0;
    this.oldPos[0]=this.pos[0]=Math.random()*size-size/2;
    this.oldPos[1]=this.pos[1]=Math.random()*size-size/2;
    this.oldPos[2]=this.pos[2]=Math.random()*size/10-size/2/10;
    this.points=[];

    for(var i=0;i<this.buff.length;i+=3)
    {
        this.buff[i+0]=this.pos[0];
        this.buff[i+1]=this.pos[1];
        this.buff[i+2]=0;
    }
    this.rnd=Math.random();

    this.startTime=Date.now();
    this.endTime=Date.now()+Math.random()*10*1000+5000;
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
    // Update position
    vec3.copy(this.oldPos,this.pos);
    if(Date.now()>this.endTime)
    {
        this.spawn();
        return;
    }
    this.lifetime=Date.now()-this.startTime;
    
    for(var i=0;i<forces.length;i++)
    {
        this.apply(forces[i]);
    }
    

    vecLimit(this.velocity,maxSpeed);
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

    vec3.mul(this.velocity,this.velocity,damping);
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
            var vf=force.maxAttractForce;
            vec3.mul(vecForce,vecForce,vec3.fromValues(vf*distAlpha,vf*distAlpha,vf*distAlpha));
            vec3.add(this.velocity,this.velocity,vecForce);

            // // Apply spin force
            this.tangentForce[0]=vecNormal[1];
            this.tangentForce[1]=-vecNormal[0];
            this.tangentForce[2]=-vecNormal[2];
            
            var f=distAlpha * force.maxAngleForce;
            vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(f,f,f));
            vec3.add(this.velocity,this.velocity,this.tangentForce);
        }
    }
};





var vec=vec3.create();

exec.onTriggered=function()
{
    
    outDieSlow.set(dieSlow);
    
    dieOffArea=0;
    dieSlow=0;
    dieNear=0;

    for(var j=0;j<forces.length;j++)
    {
        cgl.pushMvMatrix();
        vec3.set(vec, forces[j].pos[0],forces[j].pos[1],forces[j].pos[2]);
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

        // outSpeed.set(p.speed/maxSpeed);

        triggerForce.trigger();
        cgl.popMvMatrix();
    }

    for(var i=0;i<particles.length;i++)
    {
        var p=particles[i];
        p.update(forces);
        outSpeed.set(p.speed/maxSpeed);
        
                
        var ppos=Math.abs( (p.pos[0]) );
        var lifetimeMul=Math.min(p.lifetime/3000,1);

        arrayWriteToEnd(p.buff,p.pos[0])
        arrayWriteToEnd(p.buff,p.pos[1])
        // arrayWriteToEnd(p.buff,p.pos[2])
        arrayWriteToEnd(p.buff,vec3.len(p.velocity)*20*lifetimeMul)
        
        
        col.set(ppos);
        outIndex.set(i);
        outPoints.set(p.buff);

        next.trigger();
    }


};



reset();
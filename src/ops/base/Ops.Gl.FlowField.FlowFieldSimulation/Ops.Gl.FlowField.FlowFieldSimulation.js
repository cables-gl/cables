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


var numParticles=1000;

// var outArr=op.outArray("points");
var size=1000;
var forces=[];
var particles=[];
// var damping = 0.85;
var damping=vec3.fromValues(0.9,0.9,0.9);
var maxSpeed=18.4252;

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
    force.range=2000;
    force.maxAttractForce=0.0;
    force.maxAngleForce=0.5;
    force.pos=vec3.fromValues(0,0,0);
    
    
    for(var i=0;i<8;i++)
    {
        var force=new Force();
        forces.push(force);
        force.range=Math.random()*300+50;
        force.maxAttractForce=Math.random()*-1;
        force.maxAngleForce=rndPos(10)+2;
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
    this.maxAttractForce=-8;
    this.maxAngleForce=2;
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
    
    // this.buff=[];
    // this.buff.length=360;
    
};

Particle.prototype.spawn=function()
{
    // this.velocity=vec3.fromValues(0,0,0);
    // this.velocity=vec3.fromValues(
    //   120*(Math.random()-0.5),
    //     120*(Math.random()-0.5),
    //     0
    //     );
    this.idleFrames=0;
    this.oldPos[0]=this.pos[0]=Math.random()*size-size/2;
    this.oldPos[1]=this.pos[1]=Math.random()*size-size/2;
    this.oldPos[2]=this.pos[2]=Math.random()*size/10-size/2/10;
    // this.oldPos[2]=this.pos[2]=0;
    // this.pos[2]=Math.random()*2-1;
    this.points=[];
    // this.buff.clear();
    
    for(var i=0;i<this.buff.length;i+=3)
    {
        this.buff[i+0]=this.pos[0]/size;
        this.buff[i+1]=this.pos[1]/size;
        // this.buff[i+2]=this.pos[2]/size;
        this.buff[i+2]=0;
        
    }
    this.rnd=Math.random();
    // this.buff=new CGL.RingBuffer(150);


    this.startTime=Date.now();
    this.endTime=Date.now()+Math.random()*10*1000+5000;
    this.lifetime=0;
    
    
    
};




function vecLimit(v,max)
{
    
    if (vec3.sqrLen(v) > max*max)
    {
        vec3.normalize(v,v);
    //   normalize();
        vec3.mul(v,v,vec3.fromValues(max,max,max));
    //   mult(max);
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
    // this.velocity.limit(maxSpeed);
    // console.log(this.velocity);
    // vec3.add(this.pos,this.pos,vec3.fromValues(0.3,0,0));
    vec3.add(this.pos,this.pos,this.velocity);

    // this.points.push(this.pos[0]/size,this.pos[1]/size,this.pos[2]/size);


    // Get particle speed
    // PVector vecLength = m_vecPos.get();
    

    // vecLength.sub(m_vecOldPos);
    vec3.sub(vecLength,this.oldPos,this.pos);
    
    //float fSpeed = vecLength.mag();
    this.speed = vec3.len(vecLength);
    // console.log(speed);
    
    if (this.speed < 0.05)
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
        else
        {
            // Particle is moving and not too far off screen
            // this.idleFrames = 0;
            
            // Render it
            // PVector vecDirNorm = vecLength.get();
            // var vecDirNorm=vec3.create();
            // vec3.normalize(vecDirNorm,vecLength);
            // stroke(255,
            //       150 + 100 * sin(vecDirNorm.x * 10),
            //       120 + 90 * sin(vecDirNorm.y * 5),
            //       fSpeed / fMaxSpeed * 200 + 55);
            // line(m_vecPos.x, m_vecPos.y, m_vecOldPos.x, m_vecOldPos.y);
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
    // PVector  = m_vecPos.get();
    // vecToOrigin.sub(force.pos);
    vec3.sub(vecToOrigin,this.pos,force.pos);
    // float fDist = vecToOrigin.mag();
    var dist = vec3.len(vecToOrigin);
    
    // console.log(dist);
    
    if (dist < force.range)
    {
        var distAlpha = (force.range - dist) / force.range;
        distAlpha = distAlpha * distAlpha;
        
        //   console.log(distAlpha);
        if (distAlpha > 0.92)
        {
            // If particle is too close to origin then kill it
            // this.spawn();
            this.spawn();
            dieNear++;
        }
        else
        {
            // console.log("YES");
            // // Apply attraction/replusion force
            // PVector vecNormal = vecToOrigin.get();
            
            // vecNormal.normalize();
            vec3.normalize(vecNormal,vecToOrigin);
            // PVector vecForce = vecNormal.get();
            vec3.copy(vecForce,vecNormal);
            // vecForce.mult(fDistAlpha * fMaxAttractForce);
            var vf=force.maxAttractForce;
            vec3.mul(vecForce,vecForce,vec3.fromValues(vf*distAlpha,vf*distAlpha,vf*distAlpha));
            // m_vecVelocity.add(vecForce);
            vec3.add(this.velocity,this.velocity,vecForce);
            
            
            
            
            // // Apply spin force
            // PVector vecTangentForce = new PVector(vecNormal.y, -vecNormal.x, 0);
            
            this.tangentForce[0]=vecNormal[1];
            this.tangentForce[1]=-vecNormal[0];
            this.tangentForce[2]=-vecNormal[2];
            
            
            // vecTangentForce.mult(fDistAlpha * fMaxAngleForce);
            var f=distAlpha * force.maxAngleForce;
            vec3.mul(this.tangentForce,this.tangentForce,vec3.fromValues(f,f,f));
            // m_vecVelocity.add(vecTangentForce);
            vec3.add(this.velocity,this.velocity,this.tangentForce);
        }
    }
};





var vec=vec3.create();

exec.onTriggered=function()
{
    
    dieOffArea=0;
    dieSlow=0;
    dieNear=0;

    for(var j=0;j<forces.length;j++)
    {
        cgl.pushMvMatrix();
        vec3.set(vec, forces[j].pos[0]/size,forces[j].pos[1]/size,forces[j].pos[2]/size);
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

        // outSpeed.set(p.speed/maxSpeed);

        triggerForce.trigger();
        cgl.popMvMatrix();
    }

    for(var i=0;i<particles.length;i++)
    {
        var p=particles[i];
        p.update(forces);
        // vec3.set(vec, p.pos[0]/size,p.pos[1]/size,p.pos[2]/size);
        // cgl.pushMvMatrix();
        // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        
        outSpeed.set(p.speed/maxSpeed);
        
        
var ppos=Math.abs( (p.pos[0]/size) );

var lifetimeMul=Math.min(p.lifetime/3000,1);

// p.buff.copyWithin(0, 3);
// p.buff[p.buff.length-3]=p.pos[0]/size;
// p.buff[p.buff.length-2]=p.pos[1]/size;
// p.buff[p.buff.length-1]=vec3.len(p.velocity)*0.01*lifetimeMul;

        arrayWriteToEnd(p.buff,p.pos[0]/size)
        arrayWriteToEnd(p.buff,p.pos[1]/size)
        // arrayWriteToEnd(p.buff,p.pos[2]/size)
        arrayWriteToEnd(p.buff,vec3.len(p.velocity)*0.01*lifetimeMul)
        
        // arrayWriteToEnd(p.buff, Math.sin(p.speed+ppos+p.rnd*20)*0.01 );

// if( ppos>0.3 && ppos<0.6)
// {
//     col.set(1);
// }
// else
col.set(ppos);
// col.set( Math.abs( p.pos[0]/size) );
outIndex.set(i);
// outOffset.set(p.buff.pos());
outPoints.set(p.buff);

        next.trigger();
        // cgl.popMvMatrix();
        

        // outArr.set(p.points);
        
    }
    
    // console.log(dieOffArea,dieSlow,dieNear);
    



};reset();
let exec = op.inTrigger("exec");
let next = op.outTrigger("next");

let numParticles = op.inValueInt("Num Particles", 100);

let inReset = op.inTriggerButton("Reset");
let inRespawn = op.inTriggerButton("Respawn all");
let inSpeed = op.inValue("Speed", 1);
let inDamping = op.inValue("Damping");

let col = op.outValue("color");

let triggerForce = op.outTrigger("force");
let inSize = op.inValue("Size Area");

let outOffset = op.outValue("offset");
let outIndex = op.outValue("Index");
let outPoints = op.outArray("Points");

let outDieSlow = op.outValue("Die Slow");

let numLinePoints = op.inValueInt("Num Line Points", 100);

let minLifetime = op.inValueInt("Min LifeTime", 5);
let maxLifetime = op.inValueInt("Max LifeTime", 5);

let posX = op.inValue("Pos X");
let posY = op.inValue("Pos Y");
let posZ = op.inValue("Pos Z");

let spawns = op.inArray("Spawn Positions");

let size = 140;
let particles = [];
let damping = vec3.fromValues(0.8, 0.8, 0.8);

let dieOffArea = 0;
let dieSlow = 0;
let dieNear = 0;

inRespawn.onTriggered = respawnAll;
let cgl = op.patch.cgl;
inReset.onTriggered = reset;

spawns.onChange = reset;

inSize.onChange = function ()
{
    size = inSize.get();
    reset();
};

inDamping.onChange = function ()
{
    damping[0] = damping[1] = damping[2] = inDamping.get();
};

numParticles.onChange = respawnAll;
numLinePoints.onChange = respawnAll;

function respawnAll()
{
    particles.length = 0;

    op.log("respawn all");
    for (let i = 0; i < numParticles.get(); i++)
    {
        let p = new Particle();
        p.spawn();
        particles[i] = p;
    }
}


function reset()
{
    if (particles.length == 0)
    {
        respawnAll();
    }
    else
    {
        for (let i = 0; i < numParticles.get(); i++)
        {
            particles[i].spawn();
        }
    }
}

function rndPos(s)
{
    if (!s)s = size;
    return Math.random() * s - s / 2;
}


var Particle = function ()
{
    this.pos = vec3.create();
    this.oldPos = vec3.create();
    this.velocity = vec3.create();
    this.tangentForce = vec3.create();
    this.idleFrames = 0;
    // this.points=[];
    this.speed = 0;

    this.buffLineStart = 0;

    this.buff = new Float32Array(2 * 3 * Math.floor(numLinePoints.get()));
    this.spawn();
};

Particle.prototype.spawn = function ()
{
    this.idleFrames = 0;

    if (spawns.get())
    {
        let spawnArr = spawns.get();
        let num = spawnArr.length / 3;

        let ind = Math.floor(num * Math.random());

        this.pos[0] = spawnArr[ind * 3 + 0] + Math.random() * size - (size / 2);
        this.pos[1] = spawnArr[ind * 3 + 1] + Math.random() * size - (size / 2);
        this.pos[2] = spawnArr[ind * 3 + 2] + Math.random() * size - (size / 2);
    }
    else
    {
        this.pos[0] = Math.random() * size - size / 2;
        this.pos[1] = Math.random() * size - size / 2;
        this.pos[2] = Math.random() * size - size / 2;
    }

    this.pos[0] += posX.get();
    this.pos[1] += posY.get();
    this.pos[2] += posZ.get();

    for (let i = 0; i < this.buff.length; i += 3)
    {
        this.buff[i + 0] = this.pos[0];
        this.buff[i + 1] = this.pos[1];
        this.buff[i + 2] = this.pos[2];
    }
    this.rnd = Math.random();


    let lt = (maxLifetime.get() - minLifetime.get()) * Math.random();

    this.startTime = CABLES.now() + (lt * 1000);

    this.endTime =
        CABLES.now() +
        (
            (
                (maxLifetime.get() - minLifetime.get()) + minLifetime.get()
            ) * 1000
        );

    this.lifetime = 0;
};




function vecLimit(v, max)
{
    if (vec3.sqrLen(v) > max * max)
    {
        vec3.normalize(v, v);
        vec3.mul(v, v, vec3.fromValues(max, max, max));
    }
}

let vecLength = vec3.create();

Particle.prototype.update = function (forces)
{
    this.velocity[0] = 0;
    this.velocity[1] = 0;
    this.velocity[2] = 0;
    // Update position
    vec3.copy(this.oldPos, this.pos);
    if (CABLES.now() < this.startTime) return;
    if (CABLES.now() > this.endTime)
    {
        this.spawn();
        return;
    }
    this.lifetime = CABLES.now() - this.startTime;

    for (let i = 0; i < CABLES.forceFieldForces.length; i++)
    {
        this.applyForce(CABLES.forceFieldForces[i]);
    }

    // var speed=timeDiff*inSpeed.get();
    // this.velocity[0]*=speed;
    // this.velocity[1]*=speed;
    // this.velocity[2]*=speed;
    // vec3.mul(this.velocity,this.velocity,speed);

    vecLimit(this.velocity, inSpeed.get());
    vec3.add(this.pos, this.pos, this.velocity);

    // Get particle speed
    vec3.sub(vecLength, this.oldPos, this.pos);
    this.speed = vec3.len(vecLength);

    if (this.speed < 0.005)
    {
        // Particle is pretty stationary
        this.idleFrames++;

        // Should we kill it yet?
        // if (this.idleFrames > 100)
        // {
        //     dieSlow++;

        //     // console.log('die faul');
        //     this.spawn();
        // }
    }
    else
    {
        // How far is particle from center of screen
        //   PVector vecDistance = new PVector(512/2, 512/2, 0);
        //   vecDistance.sub(m_vecPos);
        //   if(vecDistance.mag() > (512 * 2))
        if (vec3.len(this.pos) > 1000)
        {
            // Too far off screen - kill it
            dieOffArea++;
            // this.spawn();
            // console.log("die off");
        }
    }

    // vec3.mul(this.velocity,this.velocity,speed);
};

let vecToOrigin = vec3.create();
let vecNormal = vec3.create();
let vecForce = vec3.create();

Particle.prototype.applyForce = function (force)
{
    // Are we close enough to be influenced?
    vec3.sub(vecToOrigin, this.pos, force.pos);
    let dist = vec3.len(vecToOrigin);

    if (dist < force.range)
    {
        let distAlpha = (force.range - dist) / force.range;
        distAlpha *= distAlpha;

        if (distAlpha > 0.92)
        {
            // If particle is too close to origin then kill it
            // this.spawn();
            dieNear++;
        }
        else
        {
            vec3.normalize(vecNormal, vecToOrigin);
            vec3.copy(vecForce, vecNormal);

            vec3.mul(vecForce, vecForce, vec3.fromValues(
                force.attraction * distAlpha * timeDiff,
                force.attraction * distAlpha * timeDiff,
                force.attraction * distAlpha * timeDiff));
            vec3.add(this.velocity, this.velocity, vecForce);

            // // Apply spin force
            this.tangentForce[0] = vecNormal[1];
            this.tangentForce[1] = -vecNormal[0];
            this.tangentForce[2] = -vecNormal[2];

            let f = distAlpha * force.angle;
            vec3.mul(this.tangentForce, this.tangentForce, vec3.fromValues(
                f * timeDiff,
                f * timeDiff,
                f * timeDiff));
            vec3.add(this.velocity, this.velocity, this.tangentForce);
        }
    }
};

function arrayWriteToEnd(arr, v)
{
    for (let i = 1; i < arr.length; i++) arr[i - 1] = arr[i];
    arr[arr.length - 1] = v;
}

let vec = vec3.create();
let lastTime = 0;
var timeDiff = 0;
exec.onTriggered = function ()
{
    let time = op.patch.freeTimer.get();
    timeDiff = (time - lastTime) * inSpeed.get();
    outDieSlow.set(dieSlow);
    dieOffArea = 0;
    dieSlow = 0;
    dieNear = 0;

    if (triggerForce.isLinked())
        for (let j = 0; j < CABLES.forceFieldForces.length; j++)
        {
            cgl.pushModelMatrix();
            vec3.set(vec, CABLES.forceFieldForces[j].pos[0], CABLES.forceFieldForces[j].pos[1], CABLES.forceFieldForces[j].pos[2]);
            mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);

            // outSpeed.set(p.speed/maxSpeed);

            triggerForce.trigger();
            cgl.popModelMatrix();
        }

    for (let i = 0; i < particles.length; i++)
    {
        let p = particles[i];
        p.update(CABLES.forceFieldForces);
        // outSpeed.set(p.speed/maxSpeed);

        let ppos = Math.abs((p.pos[0]));
        let lifetimeMul = Math.min(p.lifetime / 3000, 1);

        // p.buff[i*3+0]=p.pos[0];
        // buffLineStart

        arrayWriteToEnd(p.buff, p.pos[0]);
        arrayWriteToEnd(p.buff, p.pos[1]);
        arrayWriteToEnd(p.buff, p.pos[2]);
        // arrayWriteToEnd(p.buff,vec3.len(p.velocity)*20*lifetimeMul)

        col.set(ppos);
        outIndex.set(i);
        outPoints.set(p.buff);

        next.trigger();
        lastTime = time;
    }
};



reset();

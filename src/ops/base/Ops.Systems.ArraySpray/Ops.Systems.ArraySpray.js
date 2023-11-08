const
    exe = op.inTrigger("exe"),
    timer = op.inValue("time"),
    num = op.inValue("num", 100),
    sizeX = op.inValue("Size X"),
    sizeY = op.inValue("Size Y"),
    sizeZ = op.inValue("Size Z"),
    movementX = op.inValue("movement x", 1),
    movementY = op.inValue("movement y", 1),
    movementZ = op.inValue("movement z", 1),

    centerX = op.inBool("Center X", false),
    centerY = op.inBool("Center Y", false),
    centerZ = op.inBool("Center Z", false),

    inReset = op.inTriggerButton("Reset"),
    lifetime = op.inValue("lifetime", 10),
    lifetimeMin = op.inValue("Lifetime Minimum", 5),

    outTrigger = op.outTrigger("Trigger Out"),
    outPositions = op.outArray("Positions", null, 3),
    outLifetimes = op.outArray("Lifetime");

inReset.onTriggered = reset;
const cgl = op.patch.cgl;

const particles = [];
const transVec = vec3.create();
const positions = [];
const lifetimes = [];

num.onChange =
    sizeX.onChange =
    sizeY.onChange =
    sizeZ.onChange =
    lifetime.onChange =
    centerX.onChange =
    centerY.onChange =
    centerZ.onChange =
    lifetimeMin.onChange = reset;

reset();

function Particle()
{
    this.pos = null;
    this.startPos = null;
    this.startTime = 0;// timer.get()- (Math.random() * ( lifetime.get() - lifetimeMin.get() ) + lifetimeMin.get())/2.0;
    this.lifeTime = 0;
    this.lifeTimePercent = 0;
    this.endTime = 0;

    this.pos = [0, 0, 0];
    this.moveVec = [0, 0, 0];
    this.idDead = false;

    this.random1 = Math.random();
    this.random2 = Math.random();
    this.random3 = Math.random();

    this.update = function (time)
    {
        const timeRunning = time - this.startTime;
        if (time > this.endTime) this.isDead = true;
        this.lifeTimePercent = timeRunning / (this.lifeTime);

        this.pos = vec3.fromValues(
            this.startPos[0] + timeRunning * this.moveVec[0],
            (this.startPos[1] + timeRunning * this.moveVec[1]), // -this.lifeTimePercent*this.lifeTimePercent*2.8,
            this.startPos[2] + timeRunning * this.moveVec[2]
        );
    };

    this.reAnimate = function (time)
    {
        this.isDead = false;
        this.lifeTime = Math.random() * (lifetime.get() - lifetimeMin.get()) + lifetimeMin.get();
        if (time !== undefined)
        {
            this.startTime = time;
            this.endTime = time + this.lifeTime;
        }
        else
        {
            this.startTime = timer.get() - this.lifeTime * Math.random();
            this.endTime = timer.get() + this.lifeTime * Math.random();
        }

        let r = Math.random();

        if (centerX.get())r -= 0.5;
        const x = r * sizeX.get();

        r = Math.random();
        if (centerY.get())r -= 0.5;
        const y = r * sizeY.get();

        r = Math.random();
        if (centerZ.get())r -= 0.5;
        const z = r * sizeZ.get();

        this.startPos = vec3.fromValues(
            x,
            y,
            z);

        this.moveVec = [
            Math.random() * movementX.get(),
            Math.random() * movementY.get(),
            Math.random() * movementZ.get()
        ];
    };
    this.reAnimate(0);
}

exe.onTriggered = function ()
{
    const time = timer.get();

    if (positions.length != particles.length * 3) positions.length = particles.length * 3;
    if (lifetimes.length != particles.length) lifetimes.length = particles.length;

    for (let i = 0; i < particles.length; i++)
    {
        if (particles[i].isDead)particles[i].reAnimate(time);
        particles[i].update(time);

        positions[i * 3 + 0] = particles[i].pos[0];
        positions[i * 3 + 1] = particles[i].pos[1];
        positions[i * 3 + 2] = particles[i].pos[2];

        lifetimes[i] = particles[i].lifeTimePercent;
        if (lifetimes[i] > 1.0)lifetimes[i] = 1.0;
    }

    outPositions.setRef(positions);
    outLifetimes.setRef(lifetimes);
    outTrigger.trigger();
};

function reset()
{
    particles.length = 0;

    for (let i = 0; i < num.get(); i++)
    {
        const p = new Particle();
        p.reAnimate();
        particles.push(p);
    }
}

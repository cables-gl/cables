// Op.apply(this, arguments);
let self = this;
let cgl = this.patch.cgl;

this.name = "spray";
this.exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));

this.timer = this.addInPort(new CABLES.Port(this, "time"));
this.num = this.addInPort(new CABLES.Port(this, "num"));
this.size = this.addInPort(new CABLES.Port(this, "size"));

let movementX = this.addInPort(new CABLES.Port(this, "movement x"));
let movementY = this.addInPort(new CABLES.Port(this, "movement y"));
let movementZ = this.addInPort(new CABLES.Port(this, "movement z"));
movementX.set(1);
movementY.set(1);
movementZ.set(1);

this.lifetime = this.addInPort(new CABLES.Port(this, "lifetime"));

this.trigger = this.addOutPort(new CABLES.Port(this, "trigger", CABLES.OP_PORT_TYPE_FUNCTION));
this.idx = this.addOutPort(new CABLES.Port(this, "index"));
this.lifeTimePercent = this.addOutPort(new CABLES.Port(this, "lifeTimePercent"));
let particles = [];

let transVec = vec3.create();

function Particle()
{
    this.pos = null;

    this.startPos = null;
    this.startTime = 0;
    this.lifeTime = 0;
    this.lifeTimePercent = 0;
    this.endTime = 0;

    this.pos = [0, 0, 0];
    this.moveVec = [0, 0, 0];
    this.idDead = false;

    this.update = function (time)
    {
        let timeRunning = time - this.startTime;
        if (time > this.endTime) this.isDead = true;
        this.lifeTimePercent = timeRunning / this.lifeTime;

        this.pos = vec3.fromValues(
            this.startPos[0] + timeRunning * this.moveVec[0],
            this.startPos[1] + timeRunning * this.moveVec[1],
            this.startPos[2] + timeRunning * this.moveVec[2]
        );
    };

    this.reAnimate = function (time)
    {
        this.isDead = false;
        this.startTime = time;
        this.lifeTime = Math.random() * self.lifetime.get();
        this.endTime = time + this.lifeTime;
        this.startPos = vec3.fromValues(
            Math.random() * 0.5,
            Math.random() * 0.5,
            Math.random() * 0.5);

        this.moveVec = [
            Math.random() * movementX.get(),
            Math.random() * movementY.get(),
            Math.random() * movementZ.get()
        ];
    };
    this.reAnimate(0);
}

this.exe.onTriggered = function ()
{
    // var time=self.patch.timer.getTime();
    let time = self.timer.get();
    for (let i = 0; i < particles.length; i++)
    {
        if (particles[i].isDead)particles[i].reAnimate(time);

        particles[i].update(time);

        cgl.pushModelMatrix();

        mat4.translate(cgl.mvMatrix, cgl.mvMatrix, particles[i].pos);

        self.idx.set(i);
        self.lifeTimePercent.val = particles[i].lifeTimePercent;
        // self.rnd.val=self.randomsFloats[i];

        self.trigger.trigger();

        cgl.popModelMatrix();
    }
};

function reset()
{
    particles.length = 0;

    for (let i = 0; i < self.num.get(); i++)
    {
        let p = new Particle();
        p.reAnimate(0);
        particles.push(p);
    }
}

this.num.onChange = reset;
this.size.onChange = reset;
this.lifetime.onChange = reset;

this.num.val = 100;
reset();

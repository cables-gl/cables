const exe=op.inTrigger("exe");
const timer=op.inValue("time");
const num=op.inValue("num",100);
const sizeX=op.inValue("Size X");
const sizeY=op.inValue("Size Y");
const sizeZ=op.inValue("Size Z");
const movementX=op.inValue("movement x",1);
const movementY=op.inValue("movement y",1);
const movementZ=op.inValue("movement z",1);
const inReset=op.inTriggerButton("Reset");
const lifetime=op.inValue("lifetime",10);
const lifetimeMin=op.inValue("Lifetime Minimum",5);


const
    outPositions=op.outArray("Positions"),
    outLifetimes=op.outArray("Lifetime");

inReset.onTriggered=reset;
const cgl=op.patch.cgl;

var particles=[];
var transVec=vec3.create();
var positions=[];
var lifetimes=[];

num.onChange=
    sizeX.onChange=
    sizeY.onChange=
    sizeZ.onChange=
    lifetime.onChange=
    lifetimeMin.onChange=reset;

reset();

function Particle()
{
    this.pos=null;
    this.startPos=null;
    this.startTime=0;//timer.get()- (Math.random() * ( lifetime.get() - lifetimeMin.get() ) + lifetimeMin.get())/2.0;
    this.lifeTime=0;
    this.lifeTimePercent=0;
    this.endTime=0;




    this.pos=[0,0,0];
    this.moveVec=[0,0,0];
    this.idDead=false;

    this.random1=Math.random();
    this.random2=Math.random();
    this.random3=Math.random();

    this.update=function(time)
    {
        var timeRunning=time-this.startTime;
        if(time>this.endTime)this.isDead=true;
        this.lifeTimePercent=timeRunning/ ( this.lifeTime );

        this.pos=vec3.fromValues(
            this.startPos[0]+timeRunning*this.moveVec[0],
            (this.startPos[1]+timeRunning*this.moveVec[1]),//-this.lifeTimePercent*this.lifeTimePercent*2.8,
            this.startPos[2]+timeRunning*this.moveVec[2]
            );
    };

    this.reAnimate=function(time)
    {
        this.isDead=false;
        this.lifeTime = Math.random() * ( lifetime.get() - lifetimeMin.get() ) + lifetimeMin.get();
        if(time!==undefined)
        {
            this.startTime=time;
            this.endTime=time+this.lifeTime;
        }
        else
        {
            this.startTime = timer.get()-this.lifeTime*Math.random();
            this.endTime=timer.get()+this.lifeTime*Math.random();
        }

        this.startPos=vec3.fromValues(
            Math.random()*sizeX.get(),
            Math.random()*sizeY.get(),
            Math.random()*sizeZ.get());

        this.moveVec=[
            Math.random()*movementX.get(),
            Math.random()*movementY.get(),
            Math.random()*movementZ.get()
            ];
    };
    this.reAnimate(0);
}

exe.onTriggered=function()
{
    var time=timer.get();

    if(positions.length!=particles.length*3) positions.length=particles.length*3;
    if(lifetimes.length!=particles.length) lifetimes.length=particles.length;

    for(var i=0;i<particles.length;i++)
    {
        if(particles[i].isDead)particles[i].reAnimate(time);
        particles[i].update(time);

        positions[i*3+0]=particles[i].pos[0];
        positions[i*3+1]=particles[i].pos[1];
        positions[i*3+2]=particles[i].pos[2];

        lifetimes[i]=particles[i].lifeTimePercent;
        if(lifetimes[i]>1.0)lifetimes[i]=1.0;
        // console.log(particles[i].lifeTimePercent);
    }

    outPositions.set(null);
    outLifetimes.set(null);
    outPositions.set(positions);
    outLifetimes.set(lifetimes);

};

function reset()
{
    particles.length=0;

    for(var i=0;i<num.get();i++)
    {
        var p=new Particle();
        p.reAnimate();
        particles.push(p);
    }
}

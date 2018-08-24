
var cgl=op.patch.cgl;

var exe=op.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var timer=op.addInPort(new Port(this,"time"));
var num=op.addInPort(new Port(this,"num"));
var sizeX=op.addInPort(new Port(this,"Size X"));
var sizeY=op.addInPort(new Port(this,"Size Y"));
var sizeZ=op.addInPort(new Port(this,"Size Z"));

var movementX=op.addInPort(new Port(this,"movement x"));
var movementY=op.addInPort(new Port(this,"movement y"));
var movementZ=op.addInPort(new Port(this,"movement z"));

const inReset=op.inFunctionButton("Reset");

movementX.set(1);
movementY.set(1);
movementZ.set(1);

inReset.onTriggered=reset;

var lifetime=op.addInPort(new Port(this,"lifetime"));
var lifetimeMin=op.addInPort(new Port(this,"Lifetime Minimum"));

var trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION)) ;
var idx=op.addOutPort(new Port(this,"index")) ;
var lifeTimePercent=op.addOutPort(new Port(this,"lifeTimePercent")) ;

var outRandom1=op.addOutPort(new Port(this,"Random 1")) ;
var outRandom2=op.addOutPort(new Port(this,"Random 2")) ;
var outRandom3=op.addOutPort(new Port(this,"Random 3")) ;

var particles=[];

var transVec=vec3.create();


num.onValueChanged=reset;
sizeX.onValueChanged=reset;
sizeY.onValueChanged=reset;
sizeZ.onValueChanged=reset;
lifetime.onValueChanged=reset;
lifetimeMin.onValueChanged=reset;

lifetime.set(10);
lifetimeMin.set(7);
num.set(100);
reset();


function Particle()
{
    this.pos=null;

    this.startPos=null;
    this.startTime=0;
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
            this.startPos[1]+timeRunning*this.moveVec[1],
            this.startPos[2]+timeRunning*this.moveVec[2]
            );
    };

    this.reAnimate=function(time)
    {
        this.isDead=false;
        
        
        this.lifeTime = Math.random() * ( lifetime.get() - lifetimeMin.get() ) + lifetimeMin.get();
        
        this.startTime=time;
        
        
        this.endTime=time+this.lifeTime;
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
    for(var i=0;i<particles.length;i++)
    {
        if(particles[i].isDead)particles[i].reAnimate(time);

        particles[i].update(time);

        cgl.pushModelMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, particles[i].pos);

        idx.set(i);
        lifeTimePercent.set(particles[i].lifeTimePercent);
        
        outRandom1.set(particles[i].random1);
        outRandom2.set(particles[i].random2);
        outRandom3.set(particles[i].random3);
        
        trigger.trigger();

        cgl.popModelMatrix();
    }
};

function reset()
{
    particles.length=0;

    for(var i=0;i<num.get();i++)
    {
        var p=new Particle();
        p.reAnimate(0);
        particles.push(p);
    }
}

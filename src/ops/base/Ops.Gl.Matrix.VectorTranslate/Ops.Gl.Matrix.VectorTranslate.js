
var exec=op.inFunction("Exec");
var speed=op.inValue("Speed");
var vecX=op.inValue("Vector X");
var vecY=op.inValue("Vector Y");
var vecZ=op.inValue("Vector Z");

var next=op.outFunction("Next");

var reset=this.addInPort(new Port(this,"reset",OP_PORT_TYPE_FUNCTION,{"display":"button"}));

var max=op.inValue("max");

var cgl=op.patch.cgl;

var vec=vec3.create();
var pos=vec3.create();
var mat=mat4.create();

var lastTime=0;


reset.onTriggered=function()
{
    vec3.set(pos,0,0,0);
};

var dir=false;
function changeDir(d)
{
    dir=!dir;
    
    move();
}

function isOutside()
{
    if(
        pos[0]>max.get() || pos[0]<-max.get()
        ||pos[1]>max.get() || pos[1]<-max.get()
        || pos[2]>max.get() || pos[2]<-max.get()) 
        return true;
    return false;

}


function move()
{
}


exec.onTriggered=function()
{
    timeDiff=op.patch.freeTimer.get()-lastTime;
        var m=speed.get()*timeDiff*0.1;

    vec3.set(vec,
        (vecX.get()),
        (vecY.get()),
        (vecZ.get())
        );
    
    vec3.normalize(vec,vec);
    
    vec[0]*=m;
    vec[1]*=m;
    vec[2]*=m;
    
    lastTime=op.patch.freeTimer.get();

    move();

    // if(isOutside())
    // {
    //     console.log("OUTSIDE");
    //     changeDir();
    //     var count=0;
    //     while(isOutside() && count<10)
    //     {
    //         randomize();
    // count++;
    //         move();    
    //     }
    // }

    // if(pos[0]>max.get() || pos[0]<-max.get()) changeDir();
    //     else if(pos[1]>max.get() || pos[1]<-max.get()) changeDir();
    //         else if(pos[2]>max.get() || pos[2]<-max.get()) changeDir();

    vec3.add(pos,pos,vec);
    
    cgl.pushMvMatrix();
    
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, pos);

    next.trigger();
    
    cgl.popMvMatrix();

};
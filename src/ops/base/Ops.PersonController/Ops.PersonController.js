op.name="PersonController";

var exe=op.inFunction("Exe");

var speed=op.inValue("Speed",1);

var outX=op.outValue("X");
var outY=op.outValue("Y");

var outDir=op.outValue("Dir");

var goNorth=op.inValueBool("North");
var goEast=op.inValueBool("East");
var goSouth=op.inValueBool("South");
var goWest=op.inValueBool("West");

var lastTime=Date.now();
var dir=0;

exe.onTriggered=function()
{
    var ago=(Date.now()-lastTime)/1000;
    var x=0;
    var y=0;
    if(goEast.get())x+=ago*speed.get();
    if(goWest.get())x-=ago*speed.get();
    if(goNorth.get())y+=ago*speed.get();
    if(goSouth.get())y-=ago*speed.get();
    
    if(goEast.get())dir=90;
    if(goWest.get())dir=270;
    if(goNorth.get())dir=0;
    if(goSouth.get())dir=180;

    // if(goNorth.get() && goEast.get())dir=315;
    // if(goNorth.get() && goWest.get())dir=45;
    // if(goEast.get() && goSouth.get())dir=225;
    // if(goWest.get() && goSouth.get())dir=135;
    
    outDir.set(dir);

    outX.set(outX.get()+x);
    outY.set(outY.get()+y);

    lastTime=Date.now();

};


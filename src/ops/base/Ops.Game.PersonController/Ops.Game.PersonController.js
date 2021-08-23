const exe=op.inTrigger("Exe");
const speed=op.inValue("Speed",1);
const outX=op.outValue("X");
const outY=op.outValue("Y");
const outDir=op.outValue("Dir");
const goNorth=op.inValueBool("North");
const goEast=op.inValueBool("East");
const goSouth=op.inValueBool("South");
const goWest=op.inValueBool("West");

var lastTime=performance.now();
var dir=0;

exe.onTriggered=function()
{
    var ago=(performance.now()-lastTime)/1000;
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

    outDir.set(dir);
    outX.set(outX.get()+x);
    outY.set(outY.get()+y);
    lastTime=performance.now();
};


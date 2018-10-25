
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var numx=op.inValueInt("num x");
var numy=op.inValueInt("num y");
var mul=op.addInPort(new CABLES.Port(op,"mul"));
// var center=op.addInPort(new CABLES.Port(op,"center",CABLES.OP_PORT_TYPE_VALUE,{"display":"bool"}));
var center=op.inValueBool("center");

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var outX=op.addOutPort(new CABLES.Port(op,"x"));
var outY=op.addOutPort(new CABLES.Port(op,"y"));
var idx=op.addOutPort(new CABLES.Port(op,"index"));


mul.set(1);
numx.set(5);
numy.set(5);

exe.onTriggered=function()
{
    op.patch.instancing.pushLoop((numx.get()+1)*numy.get());

    var subX=0;
    var subY=0;
    if(center.get())
    {
        subX=( (numx.get()-1)*mul.get())/2.0;
        subY=( (numy.get()-1)*mul.get())/2.0;
    }

    var m=mul.get();
    // for(var y=numy.get()-1;y>-1;y--)
    for(var y=0;y<numy.get();y++)
    {
        outY.set( (y*m) - subY);
        // for(var x=numx.get()-1;x>-1;x--)
        for(var x=0;x<numx.get();x++)
        {
            outX.set( (x*m) - subX);
            idx.set(x+y*numx.get());
            trigger.trigger();
            op.patch.instancing.increment();

        }
    }
    op.patch.instancing.popLoop();

};

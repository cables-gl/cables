const exe=op.inTrigger("exe");
const numx=op.inValueInt("num x",5);
const numy=op.inValueInt("num y",5);
const numz=op.inValueInt("num z",5);
const mul=op.inValue("mul",1);
const center=op.inValueBool("center");

const trigger=op.outTrigger('trigger');
const outX=op.addOutPort(new CABLES.Port(op,"x"));
const outY=op.addOutPort(new CABLES.Port(op,"y"));
const outZ=op.addOutPort(new CABLES.Port(op,"z"));
const idx=op.addOutPort(new CABLES.Port(op,"index"));

exe.onTriggered=function()
{
    op.patch.instancing.pushLoop((numx.get()+1)*numy.get());

    var subX=0;
    var subY=0;
    var subZ=0;
    if(center.get())
    {
        subX=( (numx.get()-1)*mul.get())/2.0;
        subY=( (numy.get()-1)*mul.get())/2.0;
        subZ=( (numz.get()-1)*mul.get())/2.0;
    }

    var m=mul.get();

    for(var z=0;z<numz.get();z++)
    {
        outZ.set( (z*m) - subZ);

        for(var y=0;y<numy.get();y++)
        {
            outY.set( (y*m) - subY);

            for(var x=0;x<numx.get();x++)
            {
                outX.set( (x*m) - subX);
                idx.set(x+y+z*numx.get() );

                trigger.trigger();
                op.patch.instancing.increment();

            }
        }
    }
    //test space
    //is this needed ? removing it doesn't seem to change anything...
    op.patch.instancing.popLoop();
};

const
    exec=op.inTrigger("update"),
    inName0=op.inString("Name 1",""),
    inName1=op.inString("Name 2",""),
    next=op.outTrigger("Next"),
    outColliding=op.outBoolNum("Colliding");

let colId=null;
let needsListenerUpdate=false;
let oldWorld=null;

inName0.onChange=inName1.onChange=()=>
{
    removeListener(oldWorld);
    needsListenerUpdate=true;
};

function removeListener(world)
{
    if(world && colId)
        world.removeCollision(colId);
    colId=null;
}

function onCollide(colliding,a,b)
{
    // console.log("COLLIDE!",colliding);
    outColliding.set(colliding);
}

function addListener(world)
{
    if(world )
        world.onCollision(inName0.get(),inName1.get(),onCollide);

}


exec.onTriggered=()=>
{
    const ammoWorld = op.patch.cgl.frameStore.ammoWorld;
    if (!ammoWorld) return;


    if (oldWorld != ammoWorld)
    {
        removeListener(oldWorld);
        oldWorld = ammoWorld;
    }

    if(needsListenerUpdate)
    {
        if(!colId)colId=addListener(ammoWorld);
        needsListenerUpdate=false;
    }

    next.trigger();

};
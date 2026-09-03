let exec = op.inTrigger("Exec");

let velX = op.inFloat("Velocity X");
let velY = op.inFloat("Velocity Y");
let velZ = op.inFloat("Velocity Z");

let doSet = op.inTriggerButton("Set");

let next = op.outTrigger("Next");

let doSetDelayed = false;

doSet.onTriggered = function ()
{
    doSetDelayed = true;
};

exec.onTriggered = function ()
{
    // console.log(CABLES.physicsCurrentBody.velocity);

    if (doSetDelayed && CABLES.physicsCurrentBody)
    {
        CABLES.physicsCurrentBody.velocity.set(
            velX.get(), // CABLES.physicsCurrentBody.velocity.x  +
            velY.get(), // CABLES.physicsCurrentBody.velocity.y +
            velZ.get()); // CABLES.physicsCurrentBody.velocity.z +
        // CABLES.physicsCurrentBody.velocity.set(velX.get(),velY.get(),velZ.get());
        doSetDelayed = false;
    }

    next.trigger();
};

const
    inexec=op.inTrigger("update"),
    inGamepad=op.inObject('Controller'),
    next=op.outTrigger("Next"),
    outvalid=op.outValue("Valid"),
    outPosX=op.outValue("Pos X"),
    outPosY=op.outValue("Pos Y"),
    outPosZ=op.outValue("Pos Z")

    ;


inexec.onTriggered=update;

function update()
{

    var gp=inGamepad.get();

    if(!gp)
    {
        outvalid.set(false);
        return;
    }
    if(!gp.pose)
    {
        outvalid.set(false);
        return;
    }


    outvalid.set(true);

    outPosX.set(gp.pose.position[0]);
    outPosY.set(gp.pose.position[1]);
    outPosZ.set(gp.pose.position[2]);


// console.log(gp);

    next.trigger();

}
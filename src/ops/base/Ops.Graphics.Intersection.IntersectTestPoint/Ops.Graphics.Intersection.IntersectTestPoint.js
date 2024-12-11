const
    trigger = op.inTrigger("Trigger"),
    inX = op.inValueFloat("X"),
    inY = op.inValueFloat("Y"),
    inZ = op.inValueFloat("Z"),

    active = op.inBool("Active", true),
    next = op.outTrigger("Next"),
    outHasHit = op.outBoolNum("Has Hit", false),
    outName = op.outString("Hit Body Name", ""),
    outX = op.outNumber("Hit X"),
    outY = op.outNumber("Hit Y"),
    outZ = op.outNumber("Hit Z");

const cgl = op.patch.cgl;
const oc = vec3.create();
const mat = mat4.create();
const dir = vec3.create();
let didsetCursor = false;

op.toWorkPortsNeedToBeLinked(trigger);

trigger.onTriggered = doRender;

function doRender()
{
    next.trigger();

    if (cgl.tempData.collisionWorld)
    {
        const bodyPoint = { "pos": [inX.get(), inY.get(), inZ.get()], "type": 3 };
        const testCollision = cgl.tempData.collisionWorld.testCollision;
        const bodies = cgl.tempData.collisionWorld.bodies;
        let found = false;

        for (let i = 0; i < bodies.length; i++)
        {
            if (testCollision(bodyPoint, bodies[i]))
            {
                outHasHit.set(true);
                outName.set(bodies[i].name);
                outX.set(inX.get());
                outY.set(inY.get());
                outZ.set(inZ.get());
                found = true;
            }
        }

        if (!found)
        {
            outName.set("");
            outHasHit.set(false);
            outX.set(0);
            outY.set(0);
            outZ.set(0);
        }
    }
}

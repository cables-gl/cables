const
    trigger = op.inTrigger("Trigger"),
    inName = op.inString("Name", "default"),
    active = op.inBool("Active", true),
    next = op.outTrigger("Next"),
    outHasHit = op.outBoolNum("Has Hit", false),
    outName = op.outString("Hit Body Name", "");

const cgl = op.patch.cgl;
const oc = vec3.create();
const mat = mat4.create();
const dir = vec3.create();

let didsetCursor = false;
let testBody = null;
let world = null;

op.toWorkPortsNeedToBeLinked(trigger);

trigger.onTriggered = doRender;

trigger.onLinkChanged =
inName.onLinkChanged =
inName.onChange = () =>
{
    testBody = null;
};

function findbody(world)
{
    const bodies = cgl.tempData.collisionWorld.bodies;

    for (let i = 0; i < bodies.length; i++)
        if (bodies[i].name == inName.get())
            return bodies[i];

    return null;
}

function doRender()
{
    next.trigger();

    if (cgl.tempData.collisionWorld)
    {
        if (!testBody || world != cgl.tempData.collisionWorld)
        {
            outName.set("");
            outHasHit.set(false);
            testBody = findbody(cgl.tempData.collisionWorld);
            world = cgl.tempData.collisionWorld;
        }

        if (testBody)
        {
            const testCollision = cgl.tempData.collisionWorld.testCollision;
            const bodies = cgl.tempData.collisionWorld.bodies;
            let found = false;

            for (let i = 0; i < bodies.length; i++)
            {
                if (testBody != bodies[i] && testCollision(testBody, bodies[i]))
                {
                    outHasHit.set(true);
                    outName.set(bodies[i].name);
                    found = true;
                }
            }

            if (!found)
            {
                outName.set("");
                outHasHit.set(false);
            }
        }
    }
    else
    {
        outHasHit.set(false);
        outName.set("");
    }
}

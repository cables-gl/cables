const
    trigger = op.inTrigger("Trigger"),
    render = op.inBool("Render", true),
    inTextCol = op.inBool("Check Body Collisions", false),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Total Bodies"),
    outCollisions = op.outArray("Collisions", []);

trigger.onTriggered = doRender;

const cgl = op.patch.cgl;

function doRender()
{
    cgl.frameStore.collisionWorld = { "bodies": [] };
    next.trigger();

    outNum.set(cgl.frameStore.collisionWorld.bodies.length);

    if (inTextCol.get()) checkCollisions();

    if (render.get())renderBodies();
}

function renderBodies()
{
    if (!CABLES.UI) return;
    const collisions = [];
    const bodies = cgl.frameStore.collisionWorld.bodies;

    for (let i = 0; i < bodies.length; i++)
    {
        const body = bodies[i];

        if (body.type === 1)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
            CABLES.GL_MARKER.drawSphere(op, body.radius);
            cgl.popModelMatrix();
        }
        else if (body.type === 2)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
            CABLES.GL_MARKER.drawCube(op, body.size[0] / 2, body.size[1] / 2, body.size[2] / 2);
            cgl.popModelMatrix();
        }
        else console.warn("[intersectWorld] unknown col shape");
    }
}

function checkCollisions()
{
    const collisions = [];
    const bodies = cgl.frameStore.collisionWorld.bodies;

    for (let j = 0; j < bodies.length; j++)
    {
        for (let i = j + 1; i < bodies.length; i++)
        {
            if (i != j)
            {
                const bodyA = bodies[i];
                const bodyB = bodies[j];

                /// //////////
                // SPHERE vs SPHERE
                if (bodyA.type == 1 && bodyB.type == 1)
                {
                    const dist = vec3.distance(bodyA.pos, bodyB.pos);

                    if (dist < bodyA.radius + bodyB.radius)
                    {
                        collisions.push({
                            "body0": bodyA,
                            "name0": bodyA.name,
                            "body1": bodyB,
                            "name1": bodyB.name
                        });
                    }
                }
                else
                if ((bodyA.type == 1 && bodyB.type == 2) || (bodyA.type == 2 && bodyB.type == 1))
                {
                    let bBox = bodyA;
                    let bSphere = bodyB;
                    if (bodyB.type == 2)
                    {
                        bBox = bodyB;
                        bSphere = bodyA;
                    }

                    let r2 = bSphere.radius * bSphere.radius;
                    let dmin = 0;

                    let dist_squared = bSphere.radius * bSphere.radius;
                    /* assume bBox.minand C2 are element-wise sorted, if not, do that now */
                    if (bSphere.pos[0] < bBox.minX) dist_squared -= (bSphere.pos[0] - bBox.minX) ** 2;
                    else if (bSphere.pos[0] > bBox.maxX) dist_squared -= (bSphere.pos[0] - bBox.maxX) ** 2;
                    if (bSphere.pos[1] < bBox.minY) dist_squared -= (bSphere.pos[1] - bBox.minY) ** 2;
                    else if (bSphere.pos[1] > bBox.maxY) dist_squared -= (bSphere.pos[1] - bBox.maxY) ** 2;
                    if (bSphere.pos[2] < bBox.minZ) dist_squared -= (bSphere.pos[2] - bBox.minZ) ** 2;
                    else if (bSphere.pos[2] > bBox.maxZ) dist_squared -= (bSphere.pos[2] - bBox.maxZ) ** 2;

                    if (dist_squared > 0)
                    {
                        collisions.push(
                            {
                                "body0": bodyA,
                                "name0": bodyA.name,
                                "body1": bodyB,
                                "name1": bodyB.name
                            });
                    }
                }
                else
                {
                    console.warn("unknown collision pair...", bodyA, bodyB);
                }
            }
        }
    }
    outCollisions.setRef(collisions, []);
}

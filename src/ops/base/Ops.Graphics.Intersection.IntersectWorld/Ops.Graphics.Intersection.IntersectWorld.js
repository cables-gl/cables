const
    trigger = op.inTrigger("Trigger"),
    inTextCol = op.inBool("Check Body Collisions", false),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Total Bodies"),
    outCollisions = op.outArray("Collisions", []);

trigger.onTriggered = doRender;

const SHAPE_SPHERE = 1;
const SHAPE_AABB = 2;
const SHAPE_POINT = 3;

const cgl = op.patch.cgl;

function doRender()
{
    cgl.tempData.collisionWorld = { "bodies": [], "testCollision": testCollision };
    next.trigger();

    outNum.set(cgl.tempData.collisionWorld.bodies.length);

    if (inTextCol.get()) checkCollisions();

    // if (render.get())renderBodies();
}

function testCollision(bodyA, bodyB)
{
    if (bodyA.type === SHAPE_SPHERE && bodyB.type === SHAPE_SPHERE)
    {
        const dist = vec3.distance(bodyA.pos, bodyB.pos);

        if (dist < bodyA.radius + bodyB.radius)
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name
            };
        }
    }
    else
    if (bodyA.type === SHAPE_POINT && bodyB.type === SHAPE_POINT)
    {
        if (bodyA.pos[0] === bodyB.pos[0] && bodyA.pos[1] === bodyB.pos[1] && bodyA.pos[2] === bodyB.pos[2])
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name
            };
        }
    }
    else
    if (
        (bodyB.type === SHAPE_SPHERE && bodyA.type === SHAPE_POINT) ||
                    (bodyA.type === SHAPE_SPHERE && bodyB.type === SHAPE_POINT)
    )
    {
        let bodyPoint = bodyA;
        let bodySphere = bodyB;

        if (bodyA.type === SHAPE_SPHERE)
        {
            bodyPoint = bodyB;
            bodySphere = bodyA;
        }

        const xd = Math.abs(bodyPoint.pos[0] - bodySphere.pos[0]);
        const yd = Math.abs(bodyPoint.pos[1] - bodySphere.pos[1]);
        const zd = Math.abs(bodyPoint.pos[2] - bodySphere.pos[2]);
        const dist = Math.sqrt(xd * xd + yd * yd + zd * zd);

        if (dist < bodySphere.radius)
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name };
        }
    }
    else
    if (
        (bodyB.type === SHAPE_AABB && bodyA.type === SHAPE_POINT) ||
                    (bodyA.type === SHAPE_AABB && bodyB.type === SHAPE_POINT)
    )
    {
        let bodyPoint = bodyA;
        let bodyBox = bodyB;

        if (bodyA.type === SHAPE_AABB)
        {
            bodyPoint = bodyB;
            bodyBox = bodyA;
        }

        if (
            (bodyPoint.pos[0] > bodyBox.minX && bodyPoint.pos[0] < bodyBox.maxX) &&
            (bodyPoint.pos[1] > bodyBox.minY && bodyPoint.pos[1] < bodyBox.maxY) &&
            (bodyPoint.pos[2] > bodyBox.minZ && bodyPoint.pos[2] < bodyBox.maxZ)
        )
        {
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name };
        }
    }
    else
    if ((bodyA.type === SHAPE_SPHERE && bodyB.type === SHAPE_AABB) || (bodyA.type === SHAPE_AABB && bodyB.type === SHAPE_SPHERE))
    {
        let bBox = bodyA;
        let bSphere = bodyB;
        if (bodyB.type === SHAPE_AABB)
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
            return {
                "body0": bodyA,
                "name0": bodyA.name,
                "body1": bodyB,
                "name1": bodyB.name
            };
        }
    }
    else
    {
        console.warn("unknown collision pair...", bodyA.type, bodyB.type);
    }
}

function checkCollisions()
{
    const collisions = [];
    const bodies = cgl.tempData.collisionWorld.bodies;

    for (let j = 0; j < bodies.length; j++)
    {
        for (let i = j + 1; i < bodies.length; i++)
        {
            if (i != j)
            {
                const c = testCollision(bodies[i], bodies[j]);
                if (c)collisions.push(c);
            }
        }
    }
    outCollisions.setRef(collisions, []);
}

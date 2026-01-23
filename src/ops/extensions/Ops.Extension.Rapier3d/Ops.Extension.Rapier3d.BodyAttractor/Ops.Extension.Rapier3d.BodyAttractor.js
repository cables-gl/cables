const
    exec = op.inTrigger("Trigger"),
    inAttractors = op.inArray("Attractor"),
    inBodies = op.inArray("Bodies"),
    inApply = op.inBool("Apply", true),
    inClear = op.inBool("Reset Forces", true),
    inStrength = op.inFloat("Strength", 3),
    inMinDist = op.inFloat("Min Distance", 1),
    inMaxDist = op.inFloat("Max Distance", 10),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Num Bodies"),
    result = op.outNumber("Result");

exec.onTriggered = () =>
{
    const bodies = inBodies.get();
    const attractors = inAttractors.get();

    if (!bodies || !bodies.length) return;
    if (!attractors || !attractors.length) return;
    const world = op.patch.frameStore.rapier?.world;

    if (inClear.get())
        for (let i = 0; i < bodies.length; i++)
        {
        // if (world.bodies.get(bodies[i].handle))
        // { /* OK */ }
        // else
        // {
        //     return;
        // }
            try
            {
                bodies[i].resetForces();
            }
            catch (e)
            {
                console.log("noooooooooo");
                return;
            }
        }

    if (inApply.get())
    {
        const K = inStrength.get();
        const minDistance = inMinDist.get();
        const maxDistance = inMaxDist.get();

        for (let j = 0; j < attractors.length; j++)
        {
            const attractor = attractors[j];
            const attractorPos = attractor.translation();

            for (let i = 0; i < bodies.length; i++)
            {
                const objectPos = bodies[i].translation();

                const dx = attractorPos.x - objectPos.x;
                const dy = attractorPos.y - objectPos.y;
                const dz = attractorPos.z - objectPos.z;

                const distSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distSquared);

                if (distance < minDistance || distance > maxDistance) continue;

                const dirX = dx / distance;
                const dirY = dy / distance;
                const dirZ = dz / distance;

                let forceMagnitude = 0;

                if (distance < minDistance)
                {
                    forceMagnitude = K / (distance * distance);
                }
                else
                {
                    forceMagnitude = K / (distance + 0.1);
                }

                // console.log("text", dirX, dirY, dirZ);
                bodies[i].addForce({
                    "x": dirX * forceMagnitude,
                    "y": dirY * forceMagnitude,
                    "z": dirZ * forceMagnitude
                }, true);

                // else bodies[i].applyTorqueForce({ "x": myVecX.get(), "y": myVecY.get(), "z": myVecZ.get() }, true);
            }
        }
    }
    outNum.set(bodies.length);

    next.trigger();
};

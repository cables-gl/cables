const
    inExec = op.inTrigger("Update"),
    // inCoords = op.inSwitch("Ray Coordinates", ["Screen XY", "Points 3d"], "Screen XY"),

    inX = op.inValueFloat("Screen X"),
    inY = op.inValueFloat("Screen Y"),
    // inRayPoints = op.inArray("Ray Points"),
    active = op.inBool("Active", true),
    next = op.outTrigger("next"),

    outHasHit = op.outBoolNum("Has Hit", false),
    outName = op.outString("Hit Body Name", ""),
    outX = op.outNumber("Hit X"),
    outY = op.outNumber("Hit Y"),
    outZ = op.outNumber("Hit Z");

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let world = null;
let didsetCursor = false;
let mat = mat4.create();
let isScreenCoords = true;

// inCoords.onChange = updateCoordsType;
// updateCoordsType();

// function updateCoordsType()
// {
//     isScreenCoords = inCoords.get() == "Screen XY";
//     inX.setUiAttribs({ "greyout": !isScreenCoords });
//     inY.setUiAttribs({ "greyout": !isScreenCoords });
//     inRayPoints.setUiAttribs({ "greyout": isScreenCoords });
// }

function update()
{
    world = op.patch.frameStore.rapierWorld;

    if (!world) return;

    if (active.get())
    {
        let afrom;
        let ato;

        // if (isScreenCoords)
        {
            const x = inX.get();
            const y = inY.get();

            const origin = vec3.fromValues(x, y, -1);
            mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
            mat4.invert(mat, mat);

            vec3.transformMat4(origin, origin, mat);

            // -----------

            const to = vec3.fromValues(x, y, 1);
            mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
            mat4.invert(mat, mat);

            vec3.transformMat4(to, to, mat);

            const dir = vec3.fromValues(
                to[0] - origin[0],
                to[1] - origin[1],
                to[2] - origin[2]);

            vec3.normalize(dir, dir);

            const ray = new RAPIER.Ray(new RAPIER.Vector3(origin[0], origin[1], origin[2]), new RAPIER.Vector3(dir[0], dir[1], dir[2]));

            const result = world.castRay(ray, 999, true);

            if (result && result.collider)
            {
                // console.log("cast result.collider",result.collider.parent().userData.name)

                const parent = result.collider.parent();

                if (parent && parent.userData)
                {
                    outName.set(result.collider.parent().userData.name);
                }
                else
                    outName.set("unknown");

                outX.set(origin[0] + dir[0] * result.timeOfImpact);
                outY.set(origin[1] + dir[1] * result.timeOfImpact);
                outZ.set(origin[2] + dir[2] * result.timeOfImpact);

                // console.log(result)
                outHasHit.set(true);
            }
            else
            {
                outHasHit.set(false);
            }
        }
        // else
        // {

        //     const points=inRayPoints.get();
        //     if(points)
        //     {
        //         const ray=new RAPIER.Ray(new RAPIER.Vector3(points[0],points[1],points[2]),new RAPIER.Vector3(points[3]-points[0],points[4]-points[1],points[5]-points[2]));

        //         const result=world.castRay(ray);

        //         if(result && result.collider )
        //         {

        //             outName.set(result.collider.parent().userData.name);
        //         }

        //     }
        // }

        // if (isScreenCoords)
        // {
        //     const x = inX.get();
        //     const y = inY.get();

        //     const origin = vec3.fromValues(x, y, -1);
        //     mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
        //     mat4.invert(mat, mat);

        //     vec3.transformMat4(origin, origin, mat);

        //     // -----------

        //     const to = vec3.fromValues(x, y, 1);
        //     mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
        //     mat4.invert(mat, mat);

        //     vec3.transformMat4(to, to, mat);

        //     afrom = new Ammo.btVector3(origin[0], origin[1], origin[2]);
        //     ato = new Ammo.btVector3(to[0], to[1], to[2]);
        // }
        // else
        // {
        //     const arr = inRayPoints.get() || [0, 0, 0, 0, 0, 0];

        //     afrom = new Ammo.btVector3(arr[0], arr[1], arr[2]);
        //     ato = new Ammo.btVector3(arr[3], arr[4], arr[5]);
        // }

        // const rayCallback = new Ammo.ClosestRayResultCallback(afrom, ato);
        // world.world.rayTest(afrom, ato, rayCallback);

        // if (rayCallback.hasHit())
        // {
        //     const meta = world.getBodyMeta(rayCallback.get_m_collisionObject());

        //     if (meta)
        //     {
        //         world.emitEvent("rayCastHit", meta.name);
        //         outName.set(meta.name);
        //     }

        //     outX.set(rayCallback.m_hitPointWorld.x());
        //     outY.set(rayCallback.m_hitPointWorld.y());
        //     outZ.set(rayCallback.m_hitPointWorld.z());
        // }
        // else
        // {
        //     outX.set(0);
        //     outX.set(0);
        //     outX.set(0);

        //     world.emitEvent("rayCastHit", null);

        //     outName.set("");
        // }
        // outHasHit.set(rayCallback.hasHit());

        // if (rayCallback.hasHit() && inCursor.get())
        // {
        //     op.patch.cgl.setCursor("pointer");
        //     didsetCursor = true;
        // }
        // else if (didsetCursor)
        // {
        //     op.patch.cgl.setCursor("auto");
        //     didsetCursor = false;
        // }

        // Ammo.destroy(rayCallback);
        // if (afrom)Ammo.destroy(afrom);
        // if (ato)Ammo.destroy(ato);
    }

    next.trigger();
}

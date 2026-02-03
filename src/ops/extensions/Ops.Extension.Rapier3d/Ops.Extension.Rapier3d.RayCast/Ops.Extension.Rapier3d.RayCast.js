const
    inExec = op.inTrigger("Update"),
    inType = op.inSwitch("Coordinates", ["Screen", "World"], "Screen"),
    inX = op.inValueFloat("Screen X"),
    inY = op.inValueFloat("Screen Y"),
    inRay = op.inArray("Ray Points"),
    active = op.inBool("Active", true),
    next = op.outTrigger("next"),

    outHasHit = op.outBoolNum("Has Hit", false),
    outName = op.outString("Hit Body Name", ""),
    outX = op.outNumber("Hit X"),
    outY = op.outNumber("Hit Y"),
    outZ = op.outNumber("Hit Z");

const cgl = op.patch.cgl;
let world = null;
let didsetCursor = false;
let mat = mat4.create();
let isScreenCoords = true;

inType.onChange = updateUi;
inExec.onTriggered = update;

function updateUi()
{
    inX.setUiAttribs({ "greyout": inType.get() != "Screen" });
    inY.setUiAttribs({ "greyout": inType.get() != "Screen" });
    inRay.setUiAttribs({ "greyout": inType.get() != "World" });
}

function update()
{
    world = op.patch.frameStore.rapierWorld;

    if (!world) return;

    if (active.get())
    {
        let ray;
        let origin;
        let dir;

        if (inType.get() == "Screen")
        {
            const x = inX.get();
            const y = inY.get();

            origin = vec3.fromValues(x, y, -1);
            mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
            mat4.invert(mat, mat);

            vec3.transformMat4(origin, origin, mat);

            // -----------

            const to = vec3.fromValues(x, y, 1);
            mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
            mat4.invert(mat, mat);

            vec3.transformMat4(to, to, mat);

            dir = vec3.fromValues(
                to[0] - origin[0],
                to[1] - origin[1],
                to[2] - origin[2]);

            vec3.normalize(dir, dir);

            ray = new RAPIER.Ray(new RAPIER.Vector3(origin[0], origin[1], origin[2]), new RAPIER.Vector3(dir[0], dir[1], dir[2]));
        }
        else
        {
            const rayArr = inRay.get();
            if (rayArr)
            {
                origin = [rayArr[0], rayArr[1], rayArr[2]];
                dir = [rayArr[3] - rayArr[0], rayArr[4] - rayArr[1], rayArr[5] - rayArr[2]];

                vec3.normalize(dir, dir);
                ray = new RAPIER.Ray(new RAPIER.Vector3(origin[0], origin[1], origin[2]), new RAPIER.Vector3(dir[0], dir[1], dir[2]));
            }
        }

        if (ray)

        {
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
                outName.set("unknown");
                outHasHit.set(false);
            }
        }
    }

    next.trigger();
}

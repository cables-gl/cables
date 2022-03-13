const
    inExec = op.inTrigger("Update"),
    inX = op.inValueFloat("Screen X"),
    inY = op.inValueFloat("Screen Y"),
    active=op.inBool("Active",true),
    inCursor=op.inBool("Change Cursor",true),
    next = op.outTrigger("next"),

    outHasHit=op.outBoolNum("Has Hit",false),
    outName=op.outString("Hit Body Name","");

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let world = null;
let didsetCursor=false;

let mat=mat4.create();

function update()
{
    world = cgl.frameStore.ammoWorld;
    if (!world) return;


    if(active.get())
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

        const afrom=new Ammo.btVector3(origin[0],origin[1],origin[2]);
        const ato=new Ammo.btVector3(to[0],to[1],to[2]);

        // world.ClosestRayResultCallback(afrom,ato);

        const rayCallback = new Ammo.ClosestRayResultCallback(afrom,ato);
        world.world.rayTest(afrom,ato,rayCallback);

        if (rayCallback.hasHit())
        {
            const meta=world.getBodyMeta(rayCallback.get_m_collisionObject());

            if(meta)
            {
                outName.set(meta.name);
            }
            // console.log();

            // body = btRigidBody.prototype.upcast(rayCallback.m_collisionObject);
            // if (body !== NULL)
            // {
            //     console.log("hit");
            // }
        }
        else
        {
            outName.set("");
        }
        outHasHit.set(rayCallback.hasHit());


        if (rayCallback.hasHit() && inCursor.get())
        {
            op.patch.cgl.setCursor("pointer");
            didsetCursor = true;
        }
        else if (didsetCursor)
        {
            op.patch.cgl.setCursor("auto");
            didsetCursor = false;
        }


		 //closestResults(from, to);
    }



    next.trigger();
}

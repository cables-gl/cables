const
    inRender = op.inTrigger("Render"),
    inDrawWireframe = op.inBool("Draw Wireframe", true),
    inDrawAABB = op.inBool("Draw AABB", false),
    inDrawContacts = op.inBool("Draw Contact Points", true),
    inDrawConstraints = op.inBool("Draw Constraints", false),

    inIgnClear = op.inBool("Depth", true),

    inActive = op.inBool("Active", true),

    outNext = op.outTrigger("Next");

op.setPortGroup("Options", [inDrawContacts, inDrawWireframe, inDrawAABB, inIgnClear]);

const cgl = op.patch.cgl;

let debugDrawer = null;
let oldWorld = null;

inRender.onTriggered = () =>
{
    if (cgl.frameStore.shadowPass) return outNext.trigger();

    const ammoWorld = cgl.frameStore.ammoWorld;
    if (!ammoWorld) return;

    if (!debugDrawer || oldWorld != ammoWorld.world)
    {
        debugDrawer = new CABLES.AmmoDebugDrawer(ammoWorld.world, { });
        debugDrawer.enable();
        oldWorld = ammoWorld.world;
    }

    if (!inActive.get())
    {
        outNext.trigger();
        return;
    }

    if (!ammoWorld) return;

    let debugmode = 0;
    if (inDrawWireframe.get())debugmode |= 1;
    if (inDrawAABB.get())debugmode |= 2;
    if (inDrawContacts.get())debugmode |= 8;
    if (inDrawConstraints.get())
    {
        debugmode |= 2048;
        debugmode |= 4096;
    }

    //       DrawConstraints: 1 << 11, //2048
    //   DrawConstraintLimits: 1 << 12, //4096
    //   FastWireframe: 1 << 13, //8192
    //   DrawNormals: 1 << 14, //16384

    outNext.trigger();

    debugmode |= 16384;

    if (debugmode)
    {
        cgl.pushModelMatrix();
        cgl.pushDepthTest(inIgnClear.get());
        cgl.pushDepthWrite(inIgnClear.get());

        mat4.identity(cgl.mMatrix);

        debugDrawer.setDebugMode(debugmode);
        debugDrawer.update();
        debugDrawer.render(cgl);
        // outPoints.set(debugDrawer.verts);

        cgl.popDepthTest();
        cgl.popDepthWrite();
        cgl.popModelMatrix();
    }
};

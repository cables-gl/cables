const
    inRender = op.inTrigger("Render"),
    inDrawWireframe = op.inBool("Draw Wireframe", true),
    inDrawAABB = op.inBool("Draw AABB", false),
    inDrawContacts = op.inBool("Draw Contact Points", true),
    inIgnClear = op.inBool("Depth", true),

    inActive = op.inBool("Active", true),

    outNext = op.outTrigger("Next");

op.setPortGroup("Options", [inDrawContacts, inDrawWireframe, inDrawAABB, inIgnClear]);

const cgl = op.patch.cgl;

let debugDrawer = null;

inRender.onTriggered = () =>
{
    const ammoWorld = cgl.frameStore.ammoWorld;
    if (!ammoWorld) return;

    if (!debugDrawer)
    {
        debugDrawer = new CABLES.AmmoDebugDrawer(ammoWorld.world, { });
        debugDrawer.enable();
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

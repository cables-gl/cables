const
    exec = op.inTrigger("Trigger"),
    inArr = op.inArray("Heightmap"),
    inResX = op.inInt("Pixele Width", 32),
    inResY = op.inInt("Pixel Height", 32),
    inSizeX = op.inFloat("Size X", 0.5),
    inSizeY = op.inFloat("Size Y", 0.5),
    inSizeZ = op.inFloat("Size Z", 0.5),
    next = op.outTrigger("Next");

let groundBodyDesc;
let groundBody;
let groundColliderDesc;
let lastWorld;
let collider;

inResY.onChange =
inResX.onChange =
inSizeX.onChange =
    inSizeY.onChange =
    inSizeZ.onChange =
    inArr.onChange = () =>
    {
        remove();
    };

function remove()
{
    if (lastWorld && groundBody)lastWorld.removeRigidBody(groundBody);
    if (lastWorld && collider)lastWorld.removeCollider(collider);

    groundBodyDesc = null;
    groundBody = null;
    groundColliderDesc = null;
}

function init(world)
{
    const arr = inArr.get();

    if (arr.length / 4 != inResX.get() * inResY.get())
    {
        op.setUiError("id", "size of array does not match resx*resy", 1);
        remove();
        return;
    }

    op.setUiError("id", null);

    const heights = [];

    for (let i = 0; i < arr.length; i += 4)
    {
        heights[i / 4] = arr[i];
    }
    groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    groundBody = world.createRigidBody(groundBodyDesc);
    const scale = { "x": inSizeX.get(), "y": inSizeY.get(), "z": inSizeZ.get() };

    groundColliderDesc = RAPIER.ColliderDesc.heightfield(
        inResX.get() - 1, inResY.get() - 1, new Float32Array(heights), scale
    );

    collider = world.createCollider(groundColliderDesc, groundBody.handle);
    lastWorld = world;
}

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapierWorld;
    if (lastWorld != world)remove();
    if (inArr.get() && inArr.get().length && world && !groundBody)
        init(world);

    next.trigger();
};

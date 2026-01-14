/// hallooooooooooo
const
    exec = op.inTrigger("Execute"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outDebugPoints = op.outArray("Debug Splines"),
    outDebugColors = op.outArray("Debug Colors"),
    outVersion = op.outString("Version");

const cgl = op.patch.cgl;
let rigidBody;
let world;
wait();

function wait()
{
    if (!window.RAPIER)
    {
        console.log("waiting for rapier...");
        setTimeout(wait, 100);
    }
    else init();
}

inReset.onTriggered = init;

// async
function init()
{
    if (world)world.free();
    let gravity = { "x": 0.0, "y": -9.81, "z": 0.0 };
    // await RAPIER.init();

    world = new RAPIER.World(gravity);
    // console.log(world);

    outVersion.set(RAPIER.version());

    // let rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0);
    // let colliderDesc = RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3);
    // let colliderDesc = RAPIER.ColliderDesc.ball(0.3);

    // let rigidBody = world.createRigidBody(rigidBodyDesc);
    // let collider = world.createCollider(colliderDesc, rigidBody);

    // Create the ground
    // let rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0);
    // rigidBody = world.createRigidBody(rigidBodyDesc);
    // rigidBody.userData={name:"Ground"};

    // let colliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
    // let collider = world.createCollider(colliderDesc, rigidBody);

    // let groundColliderDesc = RAPIER.ColliderDesc.dynamic().cuboid(10.0, 0.1, 10.0);
    // let flor = world.createRigidBody(groundColliderDesc);
    // world.createCollider(groundColliderDesc,flor);

    // new RAPIER.Vector3(0,0,0)

    // Create a dynamic rigid-body.

    // for(let i=0;i<100;i++)
    // {
    //     let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(Math.random()-0.5, Math.random()*3+3, Math.random()-0.5);
    //     rigidBody = world.createRigidBody(rigidBodyDesc);

    //     let colliderDesc = RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1);
    //     let collider = world.createCollider(colliderDesc, rigidBody);
    // }
}

exec.onTriggered = () =>
{
    if (!world) return;

    const oldWorld = cgl.frameStore.rapierWorld;
    cgl.frameStore.rapierWorld = world;

    world.step();

    const ray = new RAPIER.Ray(new RAPIER.Vector3(-0.5, 0, 0), new RAPIER.Vector3(1, 0, 0));
    const result = world.castRay(ray);
    // console.log("result",result); // this will be null if using the ball shape

    const dbg = world.debugRender();
    outDebugPoints.set(dbg.vertices);
    outDebugColors.set(dbg.colors);

    next.trigger();

    cgl.frameStore.rapierWorld = oldWorld;
};

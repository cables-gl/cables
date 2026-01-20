const
    exec = op.inTrigger("Execute"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outDebugPoints = op.outArray("Debug Splines"),
    outDebugColors = op.outArray("Debug Colors"),
    outVersion = op.outString("Version");

let rigidBody;
let world;
let eventQueue;
let collisions = {};

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

async function init()
{
    if (world)world.free();
    let gravity = { "x": 0.0, "y": -9.81, "z": 0.0 };
    await RAPIER.init();

    world = new RAPIER.World(gravity);
    // console.log(world);
    eventQueue = new RAPIER.EventQueue(true);

    outVersion.set(RAPIER.version());
    collisions = {};

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

    const oldWorld = op.patch.frameStore.rapierWorld;
    op.patch.frameStore.rapierWorld = world;
    op.patch.frameStore.rapierEventQueue = eventQueue;

    world.step(eventQueue);

    const ray = new RAPIER.Ray(new RAPIER.Vector3(-0.5, 0, 0), new RAPIER.Vector3(1, 0, 0));
    const result = world.castRay(ray);
    // console.log("result",result); // this will be null if using the ball shape

    const dbg = world.debugRender();
    outDebugPoints.set(dbg.vertices);
    outDebugColors.set(dbg.colors);
    eventQueue.drainCollisionEvents((handle1, handle2, started) =>
    {
        // if (started) {
        //   if (
        //     (handle1 === colliderA.handle && handle2 === colliderB.handle) ||
        //     (handle1 === colliderB.handle && handle2 === colliderA.handdle)
        //   ) {
        //     onBodiesCollide(bodyA, bodyB);
        //   }
        // console.log("colliders[i].handle", handle1);
        const id = Math.min(handle1, handle2) + "_" + Math.max(handle2, handle1);

        collisions[id] = { "handle1": handle1, "handle2": handle2, "started": started };
        if (!started) delete collisions[id];
        // for (let i = 0; i < colliders.length; i++)
        // {
        //     if (colliders[i].handle == handle1 ||
        //     colliders[i].handle == handle2
        //     )
        //     {
        //         // console.log("text");
        //     }
        // }
    });

    // console.log("collo",collisions.length);
    op.patch.frameStore.rapierCollisionEvents = collisions;
    // console.log("text", collisions);

    next.trigger();

    op.patch.frameStore.rapierWorld = oldWorld;
};

// https://codesandbox.io/embed/rapier-character-controller-043f02

const
    exec = op.inTrigger("Trigger"),
    reset = op.inTriggerButton("Reset"),
    inHeight = op.inFloat("Height", 1),
    inWidth = op.inFloat("Width", 0.2),
    inVecX = op.inFloat("Vector X"),
    inVecY = op.inFloat("Vector Y", -0.05),
    inVecZ = op.inFloat("Vector Z"),
    next = op.outTrigger("Next"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outCollider = op.outArray("Collider");

let characterController = null;
let world = null;
let rigidBody = null;
let collider = null;
let needsSetup = true;
let pos = null;
let movement = null;

op.onDelete = remove;

inWidth.onChange =
    inHeight.onChange =
    reset.onTriggered =
    op.onDelete = () =>
    {
        let needsSetup = true;
    };

exec.onTriggered = () =>
{
    const cworld = op.patch.frameStore.rapier.world;
    if (world != cworld)
    {
        characterController = null;
        rigidBody = null;
        needsSetup = true;
    }
    if (!cworld) return;

    world = cworld;

    if (needsSetup)
    {
        const colliderDesc = RAPIER.ColliderDesc.capsule(inHeight.get(), inWidth.get());
        // const rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased().setTranslation(-1.5,1.32,0);
        const rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-1.5, 2.32, 0);
        rigidBody = world.createRigidBody(rigidBodyDesc);

        colliderDesc.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
        colliderDesc.setFriction(0.1);
        collider = world.createCollider(colliderDesc, rigidBody);
        outCollider.setRef([collider]);

        characterController = world.createCharacterController(0.01);
        characterController.setCharacterMass(1);
        characterController.setUp({ "x": 0.0, "y": 1.0, "z": 0.0 }); // Up vector

        // Don’t allow climbing slopes larger than 45 degrees.
        characterController.setMaxSlopeClimbAngle(90 * Math.PI / 180);
        // Automatically slide down on slopes smaller than 30 degrees.
        characterController.setMinSlopeSlideAngle(10 * Math.PI / 180);

        characterController.enableAutostep(20.9, 0.1, true);
        console.log("char setup");

        characterController.enableSnapToGround(0.3);
        characterController.setApplyImpulsesToDynamicBodies(true);

        console.log(characterController);

        pos = null;
        needsSetup = false;
    }

    outX.set(rigidBody.translation().x);
    outY.set(rigidBody.translation().y);
    outZ.set(rigidBody.translation().z);

    if (!pos) pos = new RAPIER.Vector3(0, 0, 0);
    pos = rigidBody.translation();

    movement = new RAPIER.Vector3(0.0, 0, 0);

    movement.x += inVecX.get();
    movement.y += inVecY.get();
    movement.z += inVecZ.get();

    characterController.computeColliderMovement(collider, movement, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
    // RAPIER.QueryFilterFlags.EXCLUDE_SENSORS
    // for (let i = 0; i < characterController.numComputedCollisions(); i++) {
    // let collision = characterController.computedCollision(i);
    // Do something with that collision information.
    //  }

    const isGrounded = characterController.computedGrounded();
    // console.log(isGrounded);

    let correctedMovement = characterController.computedMovement();

    // console.log(correctedMovement);
    // rigidBody.setLinvel(correctedMovement);

    pos.x += correctedMovement.x;
    pos.y += correctedMovement.y;
    pos.z += correctedMovement.z;

    // console.log(correctedMovement)

    // outX.set(pos.x);
    // outY.set(pos.y);
    // outZ.set(pos.z);

    rigidBody.setNextKinematicTranslation(pos);
    // characterController.computeColliderMovement(collider, new RAPIER.Vector3(0.2,-0.1,0) );

    // characterController.setTranslation(pos)
    // console.log(pos);
    next.trigger();
};

function remove()
{
    if (world && rigidBody) world.removeRigidBody(rigidBody);
    if (world && characterController) world.removeCharacterController(characterController);
    if (world && collider)world.removeCollider(collider);
    characterController = null;

    rigidBody = null;
}

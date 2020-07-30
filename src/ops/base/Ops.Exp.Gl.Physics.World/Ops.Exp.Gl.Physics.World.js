const exec = op.inTrigger("Exec");

const reset = op.inTriggerButton("Reset");

const groundPlane = op.inValueBool("Groundplane", false);


const gravX = op.inValue("Gravity X");
const gravY = op.inValue("Gravity Y", -9.82);
const gravZ = op.inValue("Gravity Z");

const next = op.outTrigger("next");

gravX.onChange = setGravity;
gravY.onChange = setGravity;
gravZ.onChange = setGravity;

groundPlane.onChange = setup;

const cgl = op.patch.cgl;
let world = null;
cgl.frameStore = cgl.frameStore || {};

reset.onTriggered = function ()
{
    world = null;
};

function setGravity()
{
    if (world) world.gravity.set(gravX.get(), gravY.get(), gravZ.get()); // m/s²
}

function setup()
{
    console.log("world setup");
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 13;

    world.defaultContactMaterial.contactEquationStiffness = 1e10;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    // world.gravity.set(0,-9.82,0 ); // m/s²
    // world.gravity.set(0,-9.82,0 ); // m/s²
    // world.gravity.set(gravX.get(),gravY.get(),gravZ.get() ); // m/s²
    setGravity();


    if (groundPlane.get())
    {
        // Create a plane
        // var groundBody = new CANNON.Body({
        //     mass: 0 // mass == 0 makes the body static
        // });
        // var groundShape = new CANNON.Plane();
        // groundBody.addShape(groundShape);

        // var rot = new CANNON.Vec3(0,0,1);
        // groundBody.quaternion.setFromAxisAngle(rot, Math.PI/2);
        // groundBody.position.set(0,0,0);
        // groundBody.quaternion.copy(ground.quaternion);
        // groundBody.position.copy(ground.position);

        // var rotY = new CANNON.Quaternion(0,0,0,1);
        // groundBody.quaternion.setFromAxisAngle(
        //     new CANNON.Vec3(0,0,1),
        //     Math.PI/2);
        // groundBody.position.set(0,0,0);
        // groundBody.quaternion = rotY;//.mult(groundBody.quaternion);

        const groundBody = new CANNON.Body({ "mass": 0 });
        const s = 10000;
        groundBody.addShape(new CANNON.Box(new CANNON.Vec3(s, s, s)));
        groundBody.position.set(0, -s, 0);


        world.addBody(groundBody);
    }
}


const fixedTimeStep = 1.0 / 60.0; // seconds
const maxSubSteps = 11;
let lastTime;

exec.onTriggered = function ()
{
    if (!world)setup();
    cgl.frameStore.world = world;

    next.trigger();

    const time = Date.now();

    if (lastTime !== undefined)
    {
        const dt = (time - lastTime) / 1000;
        world.step(fixedTimeStep, dt, maxSubSteps);
    }


    lastTime = time;

    console.log(world.bodies);
};

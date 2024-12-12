const exec = op.inTrigger("Exec"),

    reset = op.inTriggerButton("Reset"),
    doDraw = op.inValueBool("Draw Bodies", true),
    groundPlane = op.inValueBool("Groundplane", false),

    gravX = op.inValue("Gravity X"),
    gravY = op.inValue("Gravity Y", -9.82),
    gravZ = op.inValue("Gravity Z"),

    inIter = op.inInt("Solver Iterations", 13),

    inDefStiff = op.inInt("Contact Stiffness", 1),
    inDefRelax = op.inInt("Contact Relaxation", 4),

    inSimulate = op.inBool("Simulate", true),

    next = op.outTrigger("next"),
    outNum = op.outNumber("Num Bodies");

inDefRelax.onChange =
inDefStiff.onChange =
inIter.onChange =
gravX.onChange =
gravY.onChange =
gravZ.onChange = setGravity;

groundPlane.onChange = setup;

const cgl = op.patch.cgl;
let world = null;
cgl.tempData = cgl.tempData || {};

const fixedTimeStep = 1.0 / 60.0; // seconds
const maxSubSteps = 11;
let lastTime;

const meshCube = new CGL.WireframeCube(cgl);
// const wireSphere = new CGL.WirePoint(cgl);
// const marker = new CGL.Marker(cgl);

reset.onTriggered = function ()
{
    world = null;
};

function setGravity()
{
    if (!world) return;

    world.solver = new CANNON.SplitSolver(world.solver);

    world.gravity.set(gravX.get(), gravY.get(), gravZ.get()); // m/s²
    world.solver.iterations = inIter.get();

    world.defaultContactMaterial.contactEquationStiffness = inDefStiff.get() * 1e10;
    world.defaultContactMaterial.contactEquationRelaxation = inDefRelax.get();
    // world.defaultContactMaterial.friction = 9999999999999;
    world.defaultContactMaterial.restitution = 0.1;
    world.solver.tolerance = 0.0001;

    // const physicsMaterial = new CANNON.Material("slipperyMaterial");
    // let physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
    //     physicsMaterial,
    //     0.1, // friction coefficient
    //     0.3 // restitution
    // );
    // world.addContactMaterial(physicsContactMaterial);
}

function setup()
{
    world = new CANNON.World();
    world.uuid = CABLES.uuid();

    world.broadphase = new CANNON.NaiveBroadphase();

    // world.defaultContactMaterial.contactEquationStiffness = inDefStiff.get() * 1e10;
    // world.defaultContactMaterial.contactEquationRelaxation = inDefRelax.get();
    // world.defaultContactMaterial.contactEquationStiffness = 1e10;
    // world.defaultContactMaterial.contactEquationRelaxation = 4;
    // world.defaultContactMaterial.friction = 9999999999999;
    // world.defaultContactMaterial.restitution = 0;

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
        groundBody.name = "groundplane";
        const s = 10000;
        groundBody.addShape(new CANNON.Box(new CANNON.Vec3(s, s, s)));
        // groundBody.position.set(0, -s, 0);
        groundBody.position.set(0, -s, 0);

        world.addBody(groundBody);
    }
}

function draw()
{
    // cgl.pushDepthTest(false);

    for (let i = 0; i < world.bodies.length; i++)
    {
        cgl.pushModelMatrix();
        mat4.identity(cgl.mMatrix);
        mat4.translate(cgl.mMatrix, cgl.mMatrix, [world.bodies[i].position.x, world.bodies[i].position.y, world.bodies[i].position.z]);
        // wireSphere.render(cgl, 0.05);
        // marker.draw(cgl, 0.8, true);

        if (world.bodies[i].raycastHit)meshCube.colorShader.setColor([1, 0, 1, 0]);
        else meshCube.colorShader.setColor([0, 1, 1, 1]);

        if (world.bodies[i].shapes[0].type == CANNON.Shape.types.BOX)
        {
            meshCube.render(
                world.bodies[i].shapes[0].halfExtents.x,
                world.bodies[i].shapes[0].halfExtents.y,
                world.bodies[i].shapes[0].halfExtents.z);
        }
        else if (world.bodies[i].shapes[0].type == CANNON.Shape.types.PLANE)
        {
            // op.log("plane!");
        }
        else if (world.bodies[i].shapes[0].type == CANNON.Shape.types.SPHERE)
        {
            meshCube.render(world.bodies[i].shapes[0].radius, world.bodies[i].shapes[0].radius, world.bodies[i].shapes[0].radius);
        }

        if (world.bodies[i].shapes[0].cbl_geom)
        {
            if (!world.bodies[i].shapes[0].cbl_mesh)
                world.bodies[i].shapes[0].cbl_mesh = new CGL.Mesh(cgl, world.bodies[i].shapes[0].cbl_geom, cgl.gl.LINES);

            cgl.pushModelMatrix();
            mat4.identity(cgl.mMatrix);

            meshCube.render(0, 0, 0);

            mat4.multiply(cgl.mMatrix, cgl.mMatrix, world.bodies[i].shapes[0].cbl_mat);

            world.bodies[i].shapes[0].cbl_mesh.render(meshCube.colorShader.shader);

            cgl.popModelMatrix();
        }

        cgl.popModelMatrix();
    }
}

exec.onTriggered = function ()
{
    if (!world)setup();
    const old = cgl.tempData.world;
    cgl.tempData.world = world;

    next.trigger();

    outNum.set(world.bodies.length);

    const time = performance.now();

    if (inSimulate.get() && lastTime !== undefined)
    {
        const dt = (time - lastTime) / 1000;
        world.step(fixedTimeStep, dt, maxSubSteps);
    }

    lastTime = time;

    if (doDraw.get()) draw();
    cgl.tempData.world = old;
};

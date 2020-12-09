let exec = op.inTrigger("Exec");
let inMass = op.inValue("Mass");
let inRadius = op.inValue("Radius", 1);

let doRender = op.inValueBool("Render", true);

let posX = op.inValue("Pos X");
let posY = op.inValue("Pos Y");
let posZ = op.inValue("Pos Z");

let inReset = op.inTriggerButton("Reset");


let next = op.outTrigger("Next");
let outRadius = op.outValue("Out Radius");
let outX = op.outValue("X");
let outY = op.outValue("Y");
let outZ = op.outValue("Z");

let outHit = op.outValueBool("Ray Hit", false);

let outCollision = op.outTrigger("Collision");

let cgl = op.patch.cgl;

let m = new CGL.WirePoint(cgl, 1);

exec.onTriggered = render;

let needSetup = true;
let body = null;

inMass.onChange = setup;
inRadius.onChange = setup;
// posX.onChange=setup;
// posY.onChange=setup;
// posZ.onChange=setup;

let lastWorld = null;

let collided = false;

inReset.onTriggered = function ()
{
    needSetup = true;
};

// function createTetra()
// {
//     var verts = [new CANNON.Vec3(0,0,0),
//         new CANNON.Vec3(2,0,0),
//         new CANNON.Vec3(0,2,0),
//         new CANNON.Vec3(0,0,2)];
//     var offset = -0.35;
//     for(var i=0; i<verts.length; i++){
//         var v = verts[i];
//         v.x += offset;
//         v.y += offset;
//         v.z += offset;
//     }

//     return new CANNON.ConvexPolyhedron(verts,
//         [
//             [0,3,2], // -x
//             [0,1,3], // -y
//             [0,2,1], // -z
//             [1,2,3], // +xyz
//         ]);
// }


function setup()
{
    let world = cgl.frameStore.world;
    if (!world) return;

    if (body)world.removeBody(body);

    body = new CANNON.Body({
        "mass": inMass.get(), // kg
        "position": new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
        "shape": new CANNON.Sphere(Math.max(0, inRadius.get()))
    });


    world.addBody(body);

    body.addEventListener("collide", function (e)
    {
        collided = true;
        // collision.trigger();
    });

    body.addEventListener("raycasthit", function (e)
    {
        op.log("rauyca!!");
        // collision.trigger();
    });


    lastWorld = world;
    needSetup = false;
    outRadius.set(inRadius.get());
}

let vec = vec3.create();
let q = quat.create();

let trMat = mat4.create();
function render()
{
    if (needSetup)setup();
    if (lastWorld != cgl.frameStore.world)setup();

    if (!body) return;

    outHit.set(body.raycastHit);

    vec3.set(vec,
        body.position.x,
        body.position.y,
        body.position.z
    );

    quat.set(q,
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w);
    quat.invert(q, q);

    cgl.pushModelMatrix();

    mat4.fromRotationTranslation(trMat, q, vec);
    mat4.mul(cgl.mMatrix, trMat, cgl.mMatrix);

    if (doRender.get())m.render(cgl, inRadius.get() * 2);

    outX.set(body.position.x);
    outY.set(body.position.y);
    outZ.set(body.position.z);

    if (collided)
    {
        collided = false;
        outCollision.trigger();
    }

    CABLES.physicsCurrentBody = body;

    next.trigger();

    CABLES.physicsCurrentBody = null;
    cgl.popModelMatrix();
}

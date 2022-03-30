const
    inExec = op.inTrigger("Exec"),
    inNames = op.inString("Filter Meshes", ""),
    inMass = op.inFloat("Mass kg", 0),
    inMulSize = op.inFloat("Size Multiply", 1),
    outNum = op.outNumber("Meshes", 0);

const cgl = op.patch.cgl;
const bodies = [];
const vec = vec3.create();
const empty = vec3.create();
const trMat = mat4.create();
const size = 1.0;

let world = null;
let scene = null;
let added = false;
let currentSceneLoaded = 0;

inExec.onTriggered = update;

const SHAPE_BOX = 0;
const SHAPE_SPHERE = 1;
const shape = SHAPE_BOX;
const sizeVec = vec3.create();

const meshCube = new CGL.WireCube(cgl);

let tmpTrans=null;

inMass.onChange =
inNames.onChange =
inExec.onLinkChanged = () =>
{
    removeFromWorld();
    added = false;
};

function update()
{
    if (!added || world != cgl.frameStore.ammoWorld) addToWorld();

    for (let i = 0; i < bodies.length; i++)
    {

        cgl.pushModelMatrix();

        mat4.identity(cgl.mMatrix);
        // mat4.translate(cgl.mMatrix,cgl.mMatrix,[]);
        mat4.mul(cgl.mMatrix,cgl.mMatrix,bodies[i].node.modelMatAbs());

        if (!tmpTrans)tmpTrans = new Ammo.btTransform();

        CABLES.AmmoWorld.copyCglTransform(cgl, tmpTrans);

        bodies[i].motionState.setWorldTransform(tmpTrans);
        bodies[i].body.setWorldTransform(tmpTrans);

        cgl.popModelMatrix();

        // vec3.transformMat4(vec, empty, bodies[i].node.modelMatAbs());
        // bodies[i].body.position.x = vec[0];
        // bodies[i].body.position.y = vec[1];
        // bodies[i].body.position.z = vec[2];

        // if (bodies[i].bounds && bodies[i].body)
        // {
        //     const sc = vec3.create();
        //     mat4.getScaling(sc, bodies[i].node.modelMatAbs());

        //     const mul = inMulSize.get();

        //     const hex = bodies[i].bounds.size[0] * 0.5 * mul * sc[0];
        //     const hey = bodies[i].bounds.size[1] * 0.5 * mul * sc[1];
        //     const hez = bodies[i].bounds.size[2] * 0.5 * mul * sc[2];

        //     if (bodies[i].body.shapes[0].halfExtents.x != hex ||
        //         bodies[i].body.shapes[0].halfExtents.y != hey ||
        //         bodies[i].body.shapes[0].halfExtents.z != hez)
        //     {
        //         bodies[i].body.shapes[0].halfExtents.x = bodies[i].bounds.size[0] * 0.5 * mul * sc[0];
        //         bodies[i].body.shapes[0].halfExtents.y = bodies[i].bounds.size[1] * 0.5 * mul * sc[1];
        //         bodies[i].body.shapes[0].halfExtents.z = bodies[i].bounds.size[2] * 0.5 * mul * sc[2];

        //         // bodies[i].body.computeAABB();
        //         bodies[i].body.updateBoundingRadius();
        //     }
        // }
    }
}

function removeFromWorld()
{
    if (world)
    {
        for (let i = 0; i < bodies.length; i++)
        {
            world.removeRigidBody(bodies[i].body);
        }
    }
    bodies.length = 0;
    outNum.set(bodies.length);
    world = null;
    added = false;
}

function addToWorld()
{
    scene = cgl.frameStore.currentScene;
    if (!scene || !cgl.frameStore.ammoWorld) return;

    if (
        world != cgl.frameStore.ammoWorld ||
        currentSceneLoaded != scene.loaded) removeFromWorld();

    world = cgl.frameStore.ammoWorld;

    if (!world)
    {
        op.logError("no physics world!?");
        outNum.set(0);
        return;
    }
    if (!scene) return;


    currentSceneLoaded = scene.loaded;
    for (let i = 0; i < scene.nodes.length; i++)
    {
        if (!scene.nodes[i].mesh) continue;
        if (scene.nodes[i].name.indexOf(inNames.get()) == -1) continue;


        let colShape=null;

        console.log(scene.nodes[i]);

        // colShape = new Ammo.btBoxShape(new Ammo.btVector3(0.25,0.25,0.25));
        colShape = CABLES.AmmoWorld.createConvexHullFromGeom(scene.nodes[i].mesh.meshes[0].geom, 100);

        colShape.setMargin(0.05);

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(inMass.get(), localInertia);

        let transform = new Ammo.btTransform();
        let motionState = new Ammo.btDefaultMotionState(transform);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);
        world.addRigidBody(body);

        bodies.push({
            "node": scene.nodes[i],
            "motionState":motionState,
            "body": body
        });

        // world.addBody(body);
    }

    outNum.set(bodies.length);

    added = true;
}

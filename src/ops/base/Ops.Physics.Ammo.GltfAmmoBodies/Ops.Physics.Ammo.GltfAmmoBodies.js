const
    inExec = op.inTrigger("Exec"),
    inNames = op.inString("Filter Meshes", ""),
    inMass = op.inFloat("Mass kg", 0),
    // inMulSize = op.inFloat("Size Multiply", 1),
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

let tmpTrans = null;

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

        // const sc = vec3.create();
        // mat4.getScaling(sc, cgl.mMatrix);
        mat4.identity(cgl.mMatrix);

        mat4.mul(cgl.mMatrix, cgl.mMatrix, bodies[i].node.modelMatAbs());
        // mat4.scale(cgl.mMatrix, cgl.mMatrix, sc);

        if (!tmpTrans)tmpTrans = new Ammo.btTransform();

        CABLES.AmmoWorld.copyCglTransform(cgl, tmpTrans);

        bodies[i].motionState.setWorldTransform(tmpTrans);
        bodies[i].body.setWorldTransform(tmpTrans);

        cgl.popModelMatrix();
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

    if (world != cgl.frameStore.ammoWorld || currentSceneLoaded != scene.loaded) removeFromWorld();

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

        let colShape = null;

        scene.nodes[i].transform(cgl, 0);
        scene.nodes[i].updateMatrix();
        const sc = vec3.create();
        mat4.getScaling(sc, scene.nodes[i].modelMatAbs());

        colShape = CABLES.AmmoWorld.createConvexHullFromGeom(scene.nodes[i].mesh.meshes[0].geom, 100, scene.nodes[i]._scale);

        colShape.setMargin(0.05);

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(inMass.get(), localInertia);

        let transform = new Ammo.btTransform();
        let motionState = new Ammo.btDefaultMotionState(transform);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);
        world.addRigidBody(body);

        world.setBodyMeta(body,
            {
                "name": scene.nodes[i].name,
                "mass": inMass.get(),

            });

        bodies.push(
            {
                "node": scene.nodes[i],
                "motionState": motionState,
                "body": body
            });
    }

    outNum.set(bodies.length);

    added = true;
}

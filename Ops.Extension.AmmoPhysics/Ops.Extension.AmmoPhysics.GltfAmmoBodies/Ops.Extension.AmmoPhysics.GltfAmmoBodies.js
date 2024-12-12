const
    inExec = op.inTrigger("Exec"),
    inShape = op.inSwitch("Shape", ["Convex Hull", "Triangle Shape"], "Convex Hull"),
    inNames = op.inString("Filter Meshes", ""),
    inMass = op.inFloat("Mass kg", 0),

    inActive = op.inBool("Active", true),
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
inShape.onChange =
inNames.onChange =
inExec.onLinkChanged = () =>
{
    removeFromWorld();
    added = false;
};

inActive.onChange = () =>
{
    if (!inActive.get())removeFromWorld();
    update();
};

function update()
{
    if (!inActive.get()) return;
    if (!added || world != cglframeStoreammoWorld) addToWorld();

    if (world && bodies.length && bodies[0] && world.getBodyMeta(bodies[0].body) == undefined)removeFromWorld();

    ping();
    for (let i = 0; i < bodies.length; i++)
    {
        cgl.pushModelMatrix();

        mat4.identity(cgl.mMatrix);

        mat4.mul(cgl.mMatrix, cgl.mMatrix, bodies[i].node.modelMatAbs());

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

function ping()
{
    if (world)
        for (let i = 0; i < bodies.length; i++)
            world.pingBody(bodies[i].body);
}

function addToWorld()
{
    scene = cglframeStorecurrentScene;
    if (!scene || !cglframeStoreammoWorld) return;

    if (world != cglframeStoreammoWorld || currentSceneLoaded != scene.loaded) removeFromWorld();

    world = cglframeStoreammoWorld;

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

        const sc = scene.nodes[i]._scale || [1, 1, 1];
        const geom = scene.nodes[i].mesh.meshes[0].geom;

        if (inShape.get() == "Convex Hull")
        {
            colShape = CABLES.AmmoWorld.createConvexHullFromGeom(geom, 100, sc);
        }
        else
        {
            let mesh = new Ammo.btTriangleMesh(true, true);

            for (let i = 0; i < geom.verticesIndices.length / 3; i++)
            {
                mesh.addTriangle(
                    new Ammo.btVector3(
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3] * 3 + 0],
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3] * 3 + 1],
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3] * 3 + 2]
                    ),
                    new Ammo.btVector3(
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3 + 1] * 3 + 0],
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3 + 1] * 3 + 1],
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3 + 1] * 3 + 2]
                    ),
                    new Ammo.btVector3(
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3 + 2] * 3 + 0],
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3 + 2] * 3 + 1],
                        sc[0] * geom.vertices[geom.verticesIndices[i * 3 + 2] * 3 + 2]
                    ),
                    false);
            }

            colShape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
        }

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

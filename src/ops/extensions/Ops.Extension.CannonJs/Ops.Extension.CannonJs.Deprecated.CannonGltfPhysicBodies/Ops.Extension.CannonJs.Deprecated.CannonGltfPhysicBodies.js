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
let worldId = null;
let scene = null;

let currentSceneLoaded = 0;
inExec.onTriggered = update;

let added = false;

const SHAPE_BOX = 0;
const SHAPE_SPHERE = 1;
const shape = SHAPE_BOX;
const sizeVec = vec3.create();

const meshCube = new CGL.WireCube(cgl);

inMass.onChange =
inNames.onChange =
inExec.onLinkChanged = () =>
{
    removeFromWorld();
    added = false;
};

function update()
{
    if (!added || worldId != cgl.frameStore.world.uuid) addToWorld();

    for (let i = 0; i < bodies.length; i++)
    {
        vec3.transformMat4(vec, empty, bodies[i].node.modelMatAbs());
        bodies[i].body.position.x = vec[0];
        bodies[i].body.position.y = vec[1];
        bodies[i].body.position.z = vec[2];

        if (bodies[i].bounds && bodies[i].body)
        {
            const sc = vec3.create();
            mat4.getScaling(sc, bodies[i].node.modelMatAbs());

            const mul = inMulSize.get();

            const hex = bodies[i].bounds.size[0] * 0.5 * mul * sc[0];
            const hey = bodies[i].bounds.size[1] * 0.5 * mul * sc[1];
            const hez = bodies[i].bounds.size[2] * 0.5 * mul * sc[2];

            if (bodies[i].body.shapes[0].halfExtents.x != hex ||
            bodies[i].body.shapes[0].halfExtents.y != hey ||
            bodies[i].body.shapes[0].halfExtents.z != hez)
            {
                bodies[i].body.shapes[0].halfExtents.x = bodies[i].bounds.size[0] * 0.5 * mul * sc[0];
                bodies[i].body.shapes[0].halfExtents.y = bodies[i].bounds.size[1] * 0.5 * mul * sc[1];
                bodies[i].body.shapes[0].halfExtents.z = bodies[i].bounds.size[2] * 0.5 * mul * sc[2];

                // bodies[i].body.computeAABB();
                bodies[i].body.updateBoundingRadius();
            }
        }
    }
}

function removeFromWorld()
{
    // ...
    if (world)
    {
        for (let i = 0; i < bodies.length; i++)
        {
            world.removeBody(bodies[i].body);
        }
    }
    bodies.length = 0;
    outNum.set(bodies.length);
    world = null;
    worldId = null;
    added = false;
}

function addToWorld()
{
    scene = cgl.frameStore.currentScene;
    if (!scene || !cgl.frameStore.world) return;

    if (
        worldId != cgl.frameStore.world.uuid ||
        currentSceneLoaded != scene.loaded)removeFromWorld();

    world = cgl.frameStore.world;

    if (!world)
    {
        op.logError("no physics world!?");
        outNum.set(0);
        return;
    }
    if (!scene) return;

    worldId = world.uuid;

    currentSceneLoaded = scene.loaded;
    for (let i = 0; i < scene.nodes.length; i++)
    {
        if (!scene.nodes[i].mesh) continue;
        if (scene.nodes[i].name.indexOf(inNames.get()) == -1) continue;

        let shape = null;

        const bounds = new CABLES.CG.BoundingBox();
        scene.nodes[i].calcBounds(scene, null, bounds);

        const size = vec3.create();
        vec3.set(size, 1, 1, 1);
        shape = new CANNON.Box(new CANNON.Vec3(size[0], size[1], size[2]));
        // shape = new CANNON.Sphere(size);

        const body = new CANNON.Body({

            "name": scene.nodes[i].name + "!",
            "gltfnode": scene.nodes[i],
            "mass": inMass.get(), // kg
            "shape": shape
        });
        body.name = scene.nodes[i].name;

        bodies.push({
            "node": scene.nodes[i],
            "size": size,
            "bounds": bounds,
            "body": body
        });

        world.addBody(body);
    }

    outNum.set(bodies.length);

    added = true;
}

const
    inExec = op.inTrigger("Exec"),
    inNames = op.inString("Filter Meshes", ""),
    inMass = op.inFloat("Mass kg", 0),
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

        if (bodies[i].node.hidden && !bodies[i].hidden)
        {
            bodies[i].hidden = true;
            world.removeBody(bodies[i].body);
            console.log("removebody");
            continue;
        }
        if (!bodies[i].node.hidden && bodies[i].hidden)
        {
            bodies[i].hidden = false;
            world.addBody(bodies[i].body);
            console.log("addbody");
        }

        cgl.pushModelMatrix();
        mat4.fromRotationTranslation(trMat, [0, 0, 0, 0], vec);

        mat4.mul(cgl.mMatrix, trMat, cgl.mMatrix);
        // if (doRender.get())
        // {
        //     if (shape == SHAPE_BOX)
        //     {
        //         if (bodies[i].size)
        //             meshCube.render(cgl, bodies[i].size[0], bodies[i].size[1], bodies[i].size[2]);
        //     }
        //     else
        //     {
        //         CABLES.GL_MARKER.drawSphere(op, size);
        //     }
        // }

        cgl.popModelMatrix();
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


    console.log("gltf bodies readd");

    if (
        worldId != cgl.frameStore.world.uuid ||
        currentSceneLoaded != scene.loaded)removeFromWorld();

    world = cgl.frameStore.world;

    if (!world)
    {
        console.log("no physics world!?");
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

        const bounds = new CGL.BoundingBox();
        scene.nodes[i].calcBounds(scene, null, bounds);

        const size = vec3.create();
        vec3.set(size,
            bounds.size[0] * 0.5,
            bounds.size[1] * 0.5,
            bounds.size[2] * 0.5);
        shape = new CANNON.Box(new CANNON.Vec3(size[0], size[1], size[2]));
        // shape = new CANNON.Sphere(size);

        const body = new CANNON.Body({

            "name": scene.nodes[i].name + "!",
            "gltfnode": scene.nodes[i],
            "mass": inMass.get(), // kg
            shape
        });
        body.name = scene.nodes[i].name;

        bodies.push({
            "node": scene.nodes[i],
            "size": size,
            "body": body
        });

        world.addBody(body);
    }

    outNum.set(bodies.length);

    added = true;
}

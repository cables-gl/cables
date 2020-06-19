const
    inExec=op.inTrigger("Exec"),
    doRender=op.inBool("Render Boundings",true);

const cgl=op.patch.cgl;
const bodies=[];
const vec = vec3.create();
const empty = vec3.create();
const trMat = mat4.create();
const size=1.0;

let currentSceneLoaded=0;
inExec.onTriggered=update;

let added=false;

const SHAPE_BOX=0;
const SHAPE_SPHERE=1;
let shape=SHAPE_BOX;
let sizeVec=vec3.create();

const meshCube=new CGL.WireCube(cgl);

function update()
{
    if(!added) addToWorld();


    for(let i=0;i<bodies.length;i++)
    {
        vec3.transformMat4(vec, empty, bodies[i].node.modelMatAbs());
        bodies[i].body.position.x = vec[0];
        bodies[i].body.position.y = vec[1];
        bodies[i].body.position.z = vec[2];


        cgl.pushModelMatrix();
        mat4.fromRotationTranslation(trMat, [0,0,0,0], vec);

        mat4.mul(cgl.mMatrix, trMat, cgl.mMatrix);
        if(doRender.get())
        {
            if(shape==SHAPE_BOX)
            {
                if(bodies[i].size)
                meshCube.render(cgl,bodies[i].size[0],bodies[i].size[1],bodies[i].size[2]);

            }
            else
            {
                CABLES.GL_MARKER.drawSphere(op, size);

            }
        }

        cgl.popModelMatrix();

    }
}

function removeFromWorld()
{
    // ...
    if(world)
    {
        for(let i=0;i<bodies.length;i++)
        {
            world.removeBody(bodies[i].body);
        }
        bodies.length=0;
    }
    world=null;
    added=false;
}

let world=null;

function addToWorld()
{
    const scene=cgl.frameStore.currentScene;
    if(!cgl.frameStore.world)return;

    if(world!=cgl.frameStore.world || currentSceneLoaded != scene.loaded)removeFromWorld();

    world = cgl.frameStore.world;

    if(!world)
    {
        console.log("no physics world!?");
        return;
    }
    if (!scene) return;

    currentSceneLoaded=scene.loaded;
    for (let i = 0; i < scene.nodes.length; i++)
    {

        if(!scene.nodes[i].mesh)continue;




        let shape=null;

        const bounds = new CGL.BoundingBox();
        scene.nodes[i].calcBounds(scene,null,bounds);

        console.log(scene.nodes[i].name,bounds.size);


        let size=vec3.create();
        vec3.set(size,bounds.size[0]/2,bounds.size[1]/2,bounds.size[2]/2);
        // vec3.set(sizeVec,1.8,0.8,0.8);
        shape=new CANNON.Box(new CANNON.Vec3(size[0],size[1],size[2]) );
        // shape = new CANNON.Sphere(size);

        const body = new CANNON.Body({

            "name":scene.nodes[i].name+"!",
            "gltfnode":scene.nodes[i],
            "mass": 0, // kg
            shape
        });
        body.name=scene.nodes[i].name;

        bodies.push({
            "node":scene.nodes[i],
            "size":size,
            "body":body
            });

        world.addBody(body);

        // if (scene.nodes[i].name == name)
        // {
        //     node = scene.nodes[i];
        //     outFound.set(true);

        //     if (node && node.mesh && node.mesh.meshes && node.mesh.meshes[0].geom) outGeom.set(node.mesh.meshes[0].geom);
        //     else outGeom.set(null);
        // }
    }

    added=true;

}

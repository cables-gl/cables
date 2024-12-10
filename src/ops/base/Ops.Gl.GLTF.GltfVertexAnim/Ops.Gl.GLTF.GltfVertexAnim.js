const
    exec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name", "default"),
    inSceneTime = op.inBool("Scene Time", true),
    inTime = op.inFloat("Time", 0),
    outFound = op.outBoolNum("Found Node"),
    next = op.outTrigger("Next");

exec.onTriggered = render;
const cgl = op.patch.cgl;
let node = null;
let needsUpdate = true;
let origGMesh = null;
let mesh = null;
let geom = null;
let morphGeom = null;
let origGeom = null;

inSceneTime.onChange = updateTimeInputs;
updateTimeInputs();

let lastMorph1 = -1;
let lastMorph2 = -1;
let lastFract = -1;

inNodeName.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
    node = null;
    needsUpdate = true;
    lastMorph1 = -1;
    lastMorph2 = -1;
    lastFract = -1;
};

function updateTimeInputs()
{
    inTime.setUiAttribs({ "greyout": inSceneTime.get() });
}

function morph(finalGeom, mt, mt2, fract)
{
    if (mt && mt.vertices && mt2)
    {
        if (finalGeom.vertexNormals.length != mt.vertexNormals.length)
            finalGeom.vertexNormals = new Float32Array(mt.vertexNormals.length);

        for (let i = 0; i < finalGeom.vertices.length; i++)
        {
            finalGeom.vertices[i] =
                    origGeom.vertices[i] +
                    (1.0 - fract) * mt.vertices[i] +
                    fract * mt2.vertices[i];

            finalGeom.vertexNormals[i] =
                    (1.0 - fract) * mt.vertexNormals[i] +
                    fract * mt2.vertexNormals[i];
        }
    }
}


function update()
{
    if (!cgl.tempData.currentScene) return;

    needsUpdate = false;
    mesh = null;

    const gltf = cgl.tempData.currentScene;
    const name = inNodeName.get();
    for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
    {
        op.log(cgl.tempData.currentScene.nodes[i].name);
        if (cgl.tempData.currentScene.nodes[i].name == name)
        {
            node = cgl.tempData.currentScene.nodes[i];
            outFound.set(true);
            op.log(node);

            if (node.mesh && node.mesh.meshes)
            {
                // mesh=node.mesh.meshes[0].copy();
                origGMesh = node.mesh.meshes[0];
                origGeom = node.mesh.meshes[0].geom;
                geom = node.mesh.meshes[0].geom.copy();
                morphGeom = geom.copy();
                mesh = new CGL.Mesh(cgl, geom);
                // mesh.setGeom();
            }
            else op.warn("[gltfvertexanim] node found but no meshes");

            op.log("orig mesh", node.mesh.meshes[0]);
            op.log("mesh", mesh);
        }
    }

    if (!node)
    {
        outFound.set(false);
    }
}

function render()
{
    if (!cgl.tempData.currentScene) return;

    if (needsUpdate) update();

    if (!geom) return;
    if (!mesh) return;

    let time = cgl.tempData.currentScene.time;
    if (!inSceneTime.get())time = inTime.get();

    if (time >= geom.morphTargets.length - 1) time = geom.morphTargets.length - 1;

    let morph1 = Math.floor(time);
    let morph2 = Math.floor(time + 1);
    const fract = time % 1;

    if (lastMorph1 != morph1 || lastMorph2 != morph2 || fract != lastFract)
    {
        const mt = geom.morphTargets[morph1];
        const mt2 = geom.morphTargets[morph2];

        morph(morphGeom, mt, mt2, fract);

        mesh.updateNormals(morphGeom);
        mesh.updateVertices(morphGeom);

        lastMorph1 = morph1;
        lastMorph2 = morph2;
        lastFract = fract;
    }

    mesh.render(cgl.getShader());

    next.trigger();
}

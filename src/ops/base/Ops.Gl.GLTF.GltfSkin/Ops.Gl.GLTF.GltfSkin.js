const
    exec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name", "default"),
    inSceneTime = op.inBool("Scene Time", true),
    inTime = op.inFloat("Time", 0),
    outFound = op.outBool("Found Node"),
    outFoundSkin = op.outBool("Found Skin"),
    next = op.outTrigger("Next");

exec.onTriggered = update;
const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name);
let arr = [];
let node = null;
const tr = vec3.create();

inSceneTime.onChange = updateTimeInputs;

updateTimeInputs();

function updateTimeInputs()
{
    inTime.setUiAttribs({ "greyout": inSceneTime.get() });
}

inNodeName.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
    node = null;
    update();
};

inNodeName.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
    node = null;
    update();
};

function update()
{
    if (!cgl.frameStore.currentScene) return;

    const gltf = cgl.frameStore.currentScene;
    const name = inNodeName.get();

    for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
    {
        if (cgl.frameStore.currentScene.nodes[i].name == name)
        {
            node = cgl.frameStore.currentScene.nodes[i];
            outFound.set(true);
        }
    }

    if (!node)
    {
        outFound.set(false);
        return;
    }

    outFoundSkin.set(node.skin > -1);

    if (node.skin == -1)
    {
        return;
    }

    if (!gltf.json.skins)
    {
        console.log("no skins found...");
        return;
    }

    let time = gltf.time;
    if (!inSceneTime.get())
    {
        time = inTime.get();
    }

    // node.render(cgl);
    // node.render(cgl, false, false, false, false, false, time);
    // cgl.pushModelMatrix();
    // render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time)

    if (!inSceneTime.get())
        for (let i = 0; i < gltf.nodes.length; i++)
            if (!gltf.nodes[i].isChild)
                gltf.nodes[i].render(cgl, false, true, true, false, false, time);

    node.render(cgl, true, false, true, false, true, time);

    next.trigger();

    // cgl.popModelMatrix();
}

// const
//     exec = op.inTrigger("Render"),
//     inNodeName = op.inString("Node Name", "default"),
//     inSceneTime = op.inBool("Scene Time", true),
//     inTime = op.inFloat("Time", 0),
//     outFound = op.outBool("Found Node"),
//     outFoundSkin = op.outBool("Found Skin"),
//     next = op.outTrigger("Next");

// exec.onTriggered = update;

// const cgl = op.patch.cgl;
// const mod = new CGL.ShaderModifier(cgl, op.name);
// let arr = [];

// mod.addModule({
//     "priority": -2,
//     "name": "MODULE_VERTEX_POSITION",
//     "srcHeadVert": attachments.joints_head_vert || "",
//     "srcBodyVert": attachments.joints_vert || ""
// });

// const uniBohnenMatze = mod.addUniformVert("m4[]", "MOD_boneMats", []);

// let node = null;
// const tr = vec3.create();

// inNodeName.onChange = () =>
// {
//     op.setUiAttrib({ "extendTitle": inNodeName.get() });
//     node = null;
//     update();
// };

// function update()
// {
//     if (!cgl.frameStore.currentScene) return;

//     const gltf = cgl.frameStore.currentScene;
//     const name = inNodeName.get();

//     for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
//     {
//         if (cgl.frameStore.currentScene.nodes[i].name == name)
//         {
//             node = cgl.frameStore.currentScene.nodes[i];
//             outFound.set(true);
//         }
//     }

//     if (!node)
//     {
//         outFound.set(false);
//         return;
//     }

//     outFoundSkin.set(node.skin > -1);

//     if (node.skin == -1)
//     {
//         return;
//     }

//     if (!gltf.json.skins)
//     {
//         console.log("no skins found...");
//         return;
//     }

//     const skinIdx = 0;
//     const arrLength = gltf.json.skins[skinIdx].joints.length * 16;

//     if (arr.length != arrLength) arr.length = arrLength;

//     const invBindMatrix = mat4.create();
//     const m = mat4.create();
//     const nodeSkin = gltf.nodes[node.skin];

//     if (!inSceneTime.get())
//         for (let i = 0; i < gltf.nodes.length; i++)
//             if (!gltf.nodes[i].isChild)
//                 gltf.nodes[i].render(cgl, false, true, true, false, false, inTime.get());

//     for (let i = 0; i < gltf.json.skins[skinIdx].joints.length; i++)
//     {
//         const jointIdx = gltf.json.skins[skinIdx].joints[i];
//         const nodeJoint = gltf.nodes[jointIdx];

//         for (let j = 0; j < 16; j++)
//             invBindMatrix[j] = gltf.accBuffers[gltf.json.skins[skinIdx].inverseBindMatrices][i * 16 + j];

//         mat4.mul(m, nodeJoint.modelMatAbs(), invBindMatrix);

//         for (let j = 0; j < m.length; j++) arr[i * 16 + j] = m[j];
//     }

//     mod.setUniformValue("MOD_boneMats", arr);

//     mod.define("SKIN_NUM_BONES", gltf.json.skins[skinIdx].joints.length);

//     mod.bind();

//     // draw mesh...

//     if (node)
//     {
//         cgl.pushModelMatrix();

//         node.render(cgl, true, false, true, false, true);

//         next.trigger();

//         cgl.popModelMatrix();
//     }

//     mod.unbind();
// }

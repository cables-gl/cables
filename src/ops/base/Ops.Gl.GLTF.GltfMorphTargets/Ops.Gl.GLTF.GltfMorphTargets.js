const
    exec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name", "default"),
    inSceneTime = op.inBool("Scene Time", true),
    inTime = op.inFloat("Time", 0),
    inSubmesh = op.inInt("Submesh", 0),
    inWeights = op.inArray("Target Weights"),
    outFound = op.outBool("Found Node"),
    outFoundSkin = op.outBool("Found Skin"),
    outTargetnames = op.outArray("Target Names"),
    outTex = op.outTexture("MorphTargets Tex"),
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

function update()
{
    if (!cgl.frameStore || !cgl.frameStore.currentScene) return;

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

    // console.log(gltf.json);

    let mesh = null;

    if (node.mesh.meshes)
    {
        const idx = Math.abs(inSubmesh.get());
        if (node.mesh.meshes[idx] && node.mesh.meshes[idx])
        {
            mesh = node.mesh.meshes[idx];
        }
    }

    if (mesh && mesh.geom && mesh.geom.morphTargets)
    {
        // console.log("morphtargets",mesh.geom.morphTargets);
        // mesh=node.mesh;
    }

    if (mesh.extras && mesh.extras.targetNames) outTargetnames.set(mesh.extras.targetNames);
    // console.log("mesh",mesh.morphTargetsRenderMod.tex)

    if (mesh.morphTargetsRenderMod) outTex.setRef(mesh.morphTargetsRenderMod.tex);

    // outFoundSkin.set(node.skin > -1);

    // if (node.skin == -1)
    // {
    //     return;
    // }

    // if (!gltf.json.skins)
    // {
    //     op.warn.log("no skins found...");
    //     return;
    // }

    let time = gltf.time;
    if (!inSceneTime.get())
    {
        time = inTime.get();
    }

    // if (!inSceneTime.get())
    //     for (let i = 0; i < gltf.nodes.length; i++)
    //         if (!gltf.nodes[i].isChild)
    //             gltf.nodes[i].render(cgl, false, true, true, false, false, time);

    // transformBlend(node, cgl, time);
    // console.log(mesh)
    const w = inWeights.get();
    if (w)mesh.weights = w;
    mesh.render(cgl, true, false, true, false, true, time);

    next.trigger();
}

function transformBlend(node, cgl, time)
{
    // // let hasTrans = node._anims.trans.length > 0;
    // // let hasRot = node._anims.rot.length > 0;
    // // hasRot = false;
    // // let hasScale = node._anims.scale.length > 0;
    // // hasScale = false;

    // const animnames = Object.keys(cgl.frameStore.currentScene.uniqueAnimNames);

    // const weights = inBlendAnims.get();

    // // if ((!hasTrans && !hasRot && !hasScale) || _w === 0)
    // // {
    // //     mat4.mul(cgl.mMatrix, cgl.mMatrix, node.mat);
    // //     node._animMat = null;
    // // }
    // // else
    // {
    //     // node._animActions[n][path]
    //     // animnames

    //     node._animMat = node._animMat || mat4.create();
    //     mat4.identity(node._animMat);

    //     const playAnims = true;

    //     if (playAnims)
    //     {
    //         let _x = 0, _y = 0, _z = 0, _w = 0;

    //         for (let i = 0; i < animnames.length; i++)
    //         {
    //             const animName = animnames[i];
    //             if (!node._animActions[animName] || !node._animActions[animName].translation) continue;

    //             let _time = time;// times[animnames[i]];
    //             // let _anim = node._anims.trans[i];

    //             let _anim = node._animActions[animName].translation;
    //             let weight = weights[i];

    //             if (_anim)
    //             {
    //                 _x += _anim[0].getValue(_time) * weight + (_anim[0].getValue(0) * (1 - weight));
    //                 _y += _anim[1].getValue(_time) * weight + (_anim[1].getValue(0) * (1 - weight));
    //                 _z += _anim[2].getValue(_time) * weight + (_anim[2].getValue(0) * (1 - weight));
    //                 _w += 1;
    //             }
    //         }

    //         if (_w > 0)
    //         {
    //             _x /= _w;
    //             _y /= _w;
    //             _z /= _w;

    //             mat4.translate(node._animMat, node._animMat, [_x, _y, _z]);
    //         }
    //     }
    //     else
    //     if (node._node.translation) mat4.translate(node._animMat, node._animMat, node._node.translation);

    //     if (playAnims)
    //     {
    //         node._tempQuats = node._tempQuats || [];

    //         for (let i = 0; i < animnames.length; i++)
    //         {
    //             const animName = animnames[i];
    //             if (!node._animActions[animName] || !node._animActions[animName].translation) continue;

    //             let _time = time;// times[animnames[i]];

    //             let _tempQuat2 = node._tempQuats[i] || quat.create();

    //             // let shouldAnim = node._anims.rot[i] && node._anims.trans[i];
    //             // let _anim = node._anims.rot[i];
    //             let _anim = node._animActions[animName].rotation;
    //             let weight = weights[i];

    //             if (_anim)
    //             {
    //                 CABLES.Anim.slerpQuaternion(_time, _tempQuat2, _anim[0], _anim[1], _anim[2], _anim[3]);
    //             }
    //             node._tempQuats[i] = (_tempQuat2);
    //         }

    //         let _finalQuat = node._tempQuat;

    //         for (let i = 0; i < node._tempQuats.length; i++)
    //         {
    //             // if (weights[i] === 0) continue;
    //             quat.slerp(_finalQuat, _finalQuat, node._tempQuats[i], node._anims.trans[i] ? weights[i] : 0);
    //         }

    //         mat4.fromQuat(node._tempMat, _finalQuat);
    //         mat4.mul(node._animMat, node._animMat, node._tempMat);

    //         node._tempQuat = _finalQuat;
    //     }
    //     else if (node._rot)
    //     {
    //         mat4.fromQuat(node._tempRotmat, node._rot);
    //         mat4.mul(node._animMat, node._animMat, node._tempRotmat);
    //     }

    //     if (playAnims)
    //     {
    //         let _x = 0, _y = 0, _z = 0, _w = 0;

    //         for (let i = 0; i < animnames.length; i++)
    //         {
    //             const animName = animnames[i];
    //             if (!node._animActions[animName] || !node._animActions[animName].translation) continue;

    //             let _time = time;// times[animnames[i]];

    //             // let _anim = node._anims.scale[i];
    //             let _anim = node._animActions[animName].scaling;
    //             let weight = weights[i];

    //             if (_anim)
    //             {
    //                 _x += _anim[0].getValue(_time) * weight;
    //                 _y += _anim[1].getValue(_time) * weight;
    //                 _z += _anim[2].getValue(_time) * weight;
    //                 _w += weight;
    //             }
    //         }

    //         if (_w > 0)
    //         {
    //             _x /= _w;
    //             _y /= _w;
    //             _z /= _w;

    //             mat4.scale(node._animMat, node._animMat, [_x, _y, _z]);
    //         }
    //     }
    //     else if (node._scale) mat4.scale(node._animMat, node._animMat, node._scale);

    //     mat4.mul(cgl.mMatrix, cgl.mMatrix, node._animMat);
    // }

    // if (node.addTranslate)mat4.translate(cgl.mMatrix, cgl.mMatrix, node.addTranslate);

    // if (node.addMulMat) mat4.mul(cgl.mMatrix, cgl.mMatrix, node.addMulMat);

    // mat4.copy(node.absMat, cgl.mMatrix);
}

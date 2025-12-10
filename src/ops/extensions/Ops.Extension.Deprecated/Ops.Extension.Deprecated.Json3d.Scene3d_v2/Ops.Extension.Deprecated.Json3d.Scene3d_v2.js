op.exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let filename = op.addInPort(new CABLES.Port(op, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "3d json" }));
let trigger = op.outTrigger("trigger");
let doCreate = op.inTriggerButton("Create Nodes");
let createNonMesh = op.inValueBool("Create Non Mesh Nodes");
let createMaterials = op.inValueBool("Create Materials", false);
let detectClones = op.inValueBool("Detect Clones", true);
let inReplaceMaterials = op.inObject("Mesh Materials");
let outLoading = op.outValueBool("Loading", false);

let cgl = op.patch.cgl;

let scene = new CABLES.Variable();

cgl.frameStore.currentScene = null;

doCreate.onTriggered = createNodes;

let defaultEasing = CABLES.EASING_LINEAR;
let skipFrames = 1;
let frameNum = 0;
let cloneTransformStore = [];
let data = null;
let prevOp = null;
filename.onChange = reload;
op.exe.onTriggered = render;

let subPatchOpStart = op;
let subPatchId = op.uiAttribs.subPatch;
let subPatchOp = null;

function render()
{
    let oldScene = cgl.frameStore.currentScene;
    cgl.frameStore.currentScene = scene;
    if (cgl.frameStore.currentScene.materials)cgl.frameStore.currentScene.materials.length = 0;
    cgl.frameStore.currentScene.replaceMaterials = inReplaceMaterials.get();

    cgl.frameStore.cloneTransforms = cloneTransformStore;

    cgl.pushModelMatrix();
    trigger.trigger();
    cgl.popModelMatrix();

    cgl.frameStore.currentScene = oldScene;
}

let setPortAnimated = function (p, doLerp)
{
    p.setAnimated(true);
    if (doLerp)p.anim.defaultEasing = defaultEasing;
};

function loadMaterials(data, root)
{
    if (data.materials)
    {
        let lastSetMatop = null;
        for (let i in data.materials)
        {
            let jsonMat = data.materials[i];

            let matName = "";
            for (var j in jsonMat.properties)
            {
                if (jsonMat.properties[j].key == "?mat.name")
                {
                    matName = jsonMat.properties[j].value;
                }
            }

            for (var j in jsonMat.properties)
            {
                if (createMaterials.get() && jsonMat.properties[j].key && jsonMat.properties[j].value && jsonMat.properties[j].key == "$clr.diffuse")
                {
                    const setMatOp = op.patch.addOp("Ops.Json3d.SetMaterial", { "subPatch": subPatchId });

                    setMatOp.getPort("name").set(matName);
                    setMatOp.name = "Set Material " + matName;

                    let matOp = op.patch.addOp("Ops.Gl.Phong.PhongMaterial", { "subPatch": subPatchId });
                    matOp.getPort("diffuse r").set(jsonMat.properties[j].value[0]);
                    matOp.getPort("diffuse g").set(jsonMat.properties[j].value[1]);
                    matOp.getPort("diffuse b").set(jsonMat.properties[j].value[2]);
                    matOp.uiAttribs.title = matOp.name = "" + matName;

                    op.patch.link(setMatOp, "material", matOp, "shader");
                    op.patch.link(setMatOp, "exe", matOp, "trigger");

                    if (lastSetMatop) op.patch.link(lastSetMatop, "trigger", matOp, "render");
                    else op.patch.link(root, "trigger 0", matOp, "render");

                    lastSetMatop = setMatOp;
                    prevOp = matOp;
                }
            }
        }
    }
}

let loadCameras = function (data, seq)
{
    let i = 0;
    var camOp = null;

    function getCamera(root, _cam)
    {
        let cam = { "cam": _cam };
        for (i in root.children)
        {
            if (root.children[i].name == _cam.name)
            {
                cam.eye = root.children[i];
                cam.transformation = root.children[i].transformation;
                mat4.transpose(cam.transformation, cam.transformation);

                // guess camera target (...)
                for (let j = 0; j < root.children.length; j++)
                {
                    if (root.children[j].name == root.children[i].name + "_Target")
                    {
                        op.log("Found cameratarget!");
                        cam.target = root.children[i];
                        root.children.splice(j, 1);
                        root.children.splice(i, 1);
                        return cam;
                    }
                }
            }
        }
        return cam;
    }

    let camSeq = null;

    if (data.hasOwnProperty("cameras"))
    {
        camSeq = op.patch.addOp("Ops.Trigger.TimedSequence", { "subPatch": subPatchId, "translate": { "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y + 50 } });
        op.patch.link(camSeq, "exe", op, "trigger");

        op.log("camera....");

        let camCount = 0;
        for (i in data.cameras)
        {
            let cam = getCamera(data.rootnode, data.cameras[i]);

            if (cam)
            {
                if (!cam.target) continue;

                var camOp = op.patch.addOp("Ops.Gl.Matrix.QuaternionCamera", { "subPatch": subPatchId, "translate": { "x": op.uiAttribs.translate.x + camCount * 200, "y": op.uiAttribs.translate.y + 100 } });
                camOp.uiAttribs.title = camOp.name = "cam " + cam.cam.name;

                var an = dataGetAnimation(data, cam.cam.name);
                op.patch.link(camSeq, "trigger " + camCount, camOp, "render");
                op.patch.link(camOp, "trigger", seq, "exe " + camCount);
                camCount++;

                camOp.getPort("fov").set(cam.cam.horizontalfov);
                camOp.getPort("clip near").set(cam.cam.clipplanenear);
                camOp.getPort("clip far").set(cam.cam.clipplanefar);

                camOp.getPort("centerX").set(cam.cam.lookat[0]);
                camOp.getPort("centerY").set(cam.cam.lookat[1]);
                camOp.getPort("centerZ").set(cam.cam.lookat[2]);

                camOp.getPort("matrix").set(cam.transformation);

                if (an)
                {
                    if (an.positionkeys)
                    {
                        setPortAnimated(camOp.getPort("EyeX"), false);
                        setPortAnimated(camOp.getPort("EyeY"), false);
                        setPortAnimated(camOp.getPort("EyeZ"), false);

                        frameNum = skipFrames;
                        for (var k in an.positionkeys)
                        {
                            if (frameNum % skipFrames === 0)
                            {
                                camOp.getPort("EyeX").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][0]);
                                camOp.getPort("EyeY").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][1]);
                                camOp.getPort("EyeZ").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][2]);
                            }
                            frameNum++;
                        }
                    }

                    if (an.rotationkeys)
                    {
                        setPortAnimated(camOp.getPort("quat x"), false);
                        setPortAnimated(camOp.getPort("quat y"), false);
                        setPortAnimated(camOp.getPort("quat z"), false);
                        setPortAnimated(camOp.getPort("quat w"), false);

                        frameNum = skipFrames;
                        for (var k in an.rotationkeys)
                        {
                            if (frameNum % skipFrames == 0)
                            {
                                camOp.getPort("quat x").anim.setValue(an.rotationkeys[k][0], an.rotationkeys[k][1][0]);
                                camOp.getPort("quat y").anim.setValue(an.rotationkeys[k][0], an.rotationkeys[k][1][1]);
                                camOp.getPort("quat z").anim.setValue(an.rotationkeys[k][0], an.rotationkeys[k][1][2]);
                                camOp.getPort("quat w").anim.setValue(an.rotationkeys[k][0], an.rotationkeys[k][1][3]);
                            }
                            frameNum++;
                        }
                    }
                }
                else
                {
                    var camOp = op.patch.addOp("Ops.Gl.Matrix.LookatCamera", { "subPatch": subPatchId, "translate": { "x": op.uiAttribs.translate.x + camCount * 150, "y": op.uiAttribs.translate.y + 100 } });
                    camOp.uiAttribs.title = camOp.name = "cam " + cam.cam.name;
                    // op.patch.link(camOp,'render',self,'trigger');

                    op.patch.link(camSeq, "trigger " + camCount, camOp, "render");
                    op.patch.link(camOp, "trigger", seq, "exe " + camCount);
                    camCount++;

                    camOp.getPort("eyeX").set(900);
                    camOp.getPort("eyeY").set(900);
                    camOp.getPort("eyeZ").set(-240);

                    var an = dataGetAnimation(data, cam.cam.name);
                    if (an)
                    {
                        setPortAnimated(camOp.getPort("eyeX"), false);
                        setPortAnimated(camOp.getPort("eyeY"), false);
                        setPortAnimated(camOp.getPort("eyeZ"), false);

                        frameNum = skipFrames;
                        for (var k in an.positionkeys)
                        {
                            if (frameNum % skipFrames == 0)
                            {
                                camOp.getPort("eyeX").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][0]);
                                camOp.getPort("eyeY").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][1]);
                                camOp.getPort("eyeZ").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][2]);
                            }
                            frameNum++;
                        }
                    }

                    var an = dataGetAnimation(data, cam.cam.name + "_Target");
                    if (an)
                    {
                        setPortAnimated(camOp.getPort("centerX"), false);
                        setPortAnimated(camOp.getPort("centerY"), false);
                        setPortAnimated(camOp.getPort("centerZ"), false);

                        frameNum = skipFrames;
                        for (var k in an.positionkeys)
                        {
                            if (frameNum % skipFrames == 0)
                            {
                                camOp.getPort("centerX").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][0]);
                                camOp.getPort("centerY").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][1]);
                                camOp.getPort("centerZ").anim.setValue(an.positionkeys[k][0], an.positionkeys[k][1][2]);
                            }
                            frameNum++;
                        }
                    }
                    else
                    {
                        camOp.getPort("centerX").set(cam.target.transformation[12]);
                        camOp.getPort("centerY").set(cam.target.transformation[13]);
                        camOp.getPort("centerZ").set(cam.target.transformation[14]);

                        op.log("target not animated", cam.target.transformation[3]);
                    }
                }
            }
        }
    }

    return null;
};

function dataGetAnimation(data, name)
{
    if (!data.hasOwnProperty("animations")) return false;

    for (let iAnims in data.animations)
    {
        for (let iChannels in data.animations[iAnims].channels)
        {
            if (data.animations[iAnims].channels[iChannels].name == name)
            {
                return data.animations[iAnims].channels[iChannels];
            }
        }
    }
    return false;
}

let maxx = -3;
let row = 0;

function hasMeshChildNode(n)
{
    if (createNonMesh.get()) return true;
    if (n.meshes && n.meshes.length > 0) return true;
    if (n.hasOwnProperty("children"))
    {
        for (let i = 0; i < n.children.length; i++)
        {
            if (n.children[i].meshes && n.children[i].meshes.length > 0) return true;

            let childMeshes = hasMeshChildNode(n.children[i]);
            if (childMeshes) return true;
        }
    }

    op.log("has no childs", n);

    return false;
}

function addChild(data, x, y, parentOp, parentPort, ch)
{
    if (ch.hasOwnProperty("transformation"))
    {
        maxx = Math.max(x, maxx) + 1;
        let prevOp = null;

        if (data.hasOwnProperty("animations"))
        {
            let an = dataGetAnimation(data, ch.name);
            if (an)
            {
                if (an.positionkeys && an.positionkeys.length > 0)
                {
                    let anTransOp = op.patch.addOp("Ops.Json3d.TranslateChannel", { "subPatch": subPatchId });
                    anTransOp.uiAttribs.title = anTransOp.name = ch.name + " trans anim";
                    anTransOp.getPort("channel").set(ch.name);
                    op.patch.link(prevOp, "trigger", anTransOp, "render");

                    if (!prevOp)op.patch.link(parentOp, parentPort, anTransOp, "render");
                    prevOp = anTransOp;
                }

                if (an.rotationkeys && an.rotationkeys.length > 0)
                {
                    let anRotOp = op.patch.addOp("Ops.Json3d.QuaternionChannel", { "subPatch": subPatchId });
                    anRotOp.uiAttribs.title = anRotOp.name = ch.name + " quat rot anim";
                    anRotOp.getPort("channel").set(ch.name);
                    op.patch.link(prevOp, "trigger", anRotOp, "render");

                    if (!prevOp)op.patch.link(parentOp, parentPort, anRotOp, "render");
                    prevOp = anRotOp;
                }

                if (an.scalingkeys && an.scalingkeys.length > 0)
                {
                    let anScaleOp = op.patch.addOp("Ops.Json3d.ScaleChannel", { "subPatch": subPatchId });
                    anScaleOp.uiAttribs.title = anScaleOp.name = ch.name + " scale anim";
                    anScaleOp.getPort("channel").set(ch.name);
                    op.patch.link(prevOp, "trigger", anScaleOp, "render");

                    if (!prevOp)op.patch.link(parentOp, parentPort, anScaleOp, "render");
                    prevOp = anScaleOp;
                }
            }
        }

        let sameMesh = false;

        if (detectClones.get())
        {
            sameMesh = true;

            if (ch.hasOwnProperty("children"))
            {
                // test if children are all same mesh...

                var cloneTransforms = [];
                if (ch.children.length > 1 && ch.children[0].meshes && ch.children[0].meshes.length > 0)
                {
                    for (i = 0; i < ch.children.length; i++)
                    {
                        if (i > 0 && ch.children[i].meshes)
                        {
                            if (ch.children[0].meshes && ch.children[i].meshes && ch.children[i].meshes.length == ch.children[0].meshes.length)
                            {
                                if (ch.children[i].meshes[0] == ch.children[0].meshes[0])
                                {

                                }
                                else { sameMesh = false; }
                            }
                            else { sameMesh = false; }
                        }

                        if (sameMesh)
                        {
                            if (!ch.children[i].transposed)
                            {
                                mat4.transpose(ch.children[i].transformation, ch.children[i].transformation);
                                ch.children[i].transposed = true;
                            }
                            cloneTransforms.push(ch.children[i].transformation);
                        }
                    }
                }
                else { sameMesh = false; }
            }
            else { sameMesh = false; }
        }

        if (!prevOp)
        {
            let eq = mat4.exactEquals(ch.transformation, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

            if (!eq)
            {
                let transOp = op.patch.addOp("Ops.Gl.Matrix.MatrixMul", { "subPatch": subPatchId });

                if (!ch.transposed)
                {
                    ch.transposed = true;
                    mat4.transpose(ch.transformation, ch.transformation);
                }

                transOp.getPort("matrix").set(ch.transformation);
                prevOp = transOp;

                op.patch.link(parentOp, parentPort, prevOp, "render");
                if (ch.name) transOp.uiAttribs.title = transOp.name = ch.name;
            }
            else
                prevOp = parentOp;
        }

        var i = 0;
        if (ch.hasOwnProperty("meshes") || sameMesh)
        {
            let useChildrenMeshes = false;
            let len = 0;
            if (ch.meshes)
            {
                len = ch.meshes.length;
            }
            else
            {
                if (ch.children[0].meshes)
                {
                    len = ch.children[0].meshes.length;
                    useChildrenMeshes = true;
                }
            }

            for (i = 0; i < len; i++)
            {
                let index = -1;

                if (!useChildrenMeshes) index = ch.meshes[i];
                else index = ch.children[0].meshes[0];

                // material
                if (data.meshes[index].hasOwnProperty("materialindex") && data.hasOwnProperty("materials"))
                {
                    let matIndex = data.meshes[index].materialindex;
                    let jsonMat = data.materials[matIndex];

                    if (inReplaceMaterials.get() && inReplaceMaterials.get()[ch.name])
                    {
                        var matOp = op.patch.addOp("Ops.Json3d.SetMaterialShader", { "subPatch": subPatchId });
                        matOp.getPort("Key").set(ch.name);

                        var l = op.patch.link(prevOp, "trigger", matOp, "exe");

                        if (!l)
                        {
                            l = op.patch.link(parentOp, "trigger 15", matOp, "exe");
                        }

                        prevOp = matOp;
                    }
                    else
                    if (createMaterials.get())
                    {
                        var matOp = op.patch.addOp("Ops.Json3d.Material", { "subPatch": subPatchId });
                        op.patch.link(prevOp, "trigger", matOp, "exe");
                        prevOp = matOp;

                        for (let j in jsonMat.properties)
                            if (jsonMat.properties[j].key && jsonMat.properties[j].value && jsonMat.properties[j].key == "?mat.name")
                                matOp.getPort("name").set(jsonMat.properties[j].value);
                    }
                }

                if (!sameMesh)
                {
                    // mesh
                    var meshOp = op.patch.addOp("Ops.Json3d.Mesh", { "subPatch": subPatchId });
                    meshOp.index.val = index;
                    meshOp.uiAttribs.title = meshOp.name = ch.name + "";
                    var l = op.patch.link(prevOp, "trigger", meshOp, "render");

                    if (!l)
                    {
                        var l = op.patch.link(parentOp, "trigger 15", meshOp, "render");
                        op.log("prevOp link", parentOp);
                    }
                }
            }
        }

        if (ch.hasOwnProperty("children"))
        {
            op.log(ch.name + " children are clones: ", sameMesh);

            if (sameMesh)
            {
                let clonedOp = op.patch.addOp("Ops.Json3d.ClonedMesh", { "subPatch": subPatchId });

                clonedOp.getPort("transformations").set(cloneTransforms);

                cloneTransformStore.push(cloneTransforms);

                op.patch.link(prevOp, "trigger", clonedOp, "render");

                var meshOp = op.patch.addOp("Ops.Json3d.Mesh", { "subPatch": subPatchId });
                meshOp.index.val = ch.children[0].meshes[0];
                meshOp.uiAttribs.title = meshOp.name = "clone " + ch.name + " Mesh";
                meshOp.getPort("draw").set(false);

                op.patch.link(prevOp, "trigger", meshOp, "render");
                op.patch.link(clonedOp, "geom", meshOp, "geometry");
            }

            if (!sameMesh)
            {
                y++;
                for (i = 0; i < ch.children.length; i++)
                {
                    let xx = maxx;
                    if (ch.children.length > 1)xx++;

                    if (hasMeshChildNode(ch.children[i]))
                        addChild(data, xx, y, prevOp, "trigger", ch.children[i]);
                }
            }
        }
    }
}

function reload()
{
    doCreate.setUiAttribs({ "greyout": true });
    if (!filename.get()) return;

    function doLoad()
    {
        CABLES.ajax(
            op.patch.getFilePath(filename.get()),
            function (err, _data, xhr)
            {
                if (err)
                {
                    if (CABLES.UI)op.uiAttr({ "error": "could not load file..." });

                    op.logError("ajax error:", err);
                    op.patch.loading.finished(loadingId);
                    return;
                }
                else
                {
                    if (CABLES.UI)op.uiAttr({ "error": null });
                }

                try
                {
                    data = JSON.parse(_data);
                }
                catch (ex)
                {
                    outLoading.set(false);
                    op.patch.loading.finished(loadingId);
                    if (CABLES.UI)op.uiAttr({ "error": "could not load file..." });
                    return;
                }

                scene.setValue(data);
                doCreate.setUiAttribs({ "greyout": false });
                op.patch.loading.finished(loadingId);

                outLoading.set(false);
                if (CABLES.UI) gui.jobs().finish("loading3d" + loadingId);
                doCreate.setUiAttribs({ "greyout": false });
            });
    }

    outLoading.set(true);
    var loadingId = op.patch.loading.start("json3dScene", filename.get());
    if (CABLES.UI) gui.jobs().start({ "id": "loading3d" + loadingId, "title": "loading 3d data" }, doLoad);
    else doLoad();
}

function createNodes()
{
    if (!trigger.isLinked())
    {
        let subPatchOpStartPort = "trigger";
        if (!subPatchOp)
        {
            subPatchId = op.uiAttribs.subPatch;
            subPatchOp = op.patch.addOp(CABLES.UI.OPNAME_SUBPATCH, { "subPatch": subPatchId });
            subPatchOp.setTitle("3d scene");
            subPatchId = subPatchOp.getPort("patchId").get();
            op.patch.link(op, "trigger", subPatchOp, "create port");

            let inputs = op.patch.getOpsByObjName("Ops.Ui.PatchInput");

            for (var i = 0; i < inputs.length; i++)
            {
                if (inputs[i].uiAttribs.subPatch == subPatchId)
                {
                    subPatchOpStart = inputs[i];
                    subPatchOpStartPort = subPatchOpStart.portsOut[0].name;
                }
            }
        }

        let rootMatrixOp = op.patch.addOp("Ops.Gl.Matrix.MatrixMul", { "subPatch": subPatchId, "translate": { "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y + 75 } });
        rootMatrixOp.uiAttribs.title = "rootMatrix";

        mat4.transpose(data.rootnode.transformation, data.rootnode.transformation);
        rootMatrixOp.getPort("matrix").set(data.rootnode.transformation);

        // op.patch.link(op,'trigger',rootMatrixOp,'render');
        op.patch.link(subPatchOpStart, subPatchOpStartPort, rootMatrixOp, "render");

        let root = op.patch.addOp("Ops.Sequence", { "subPatch": subPatchId, "translate": { "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y + 150 } });
        let camOp = loadCameras(data, root);

        if (camOp) op.patch.link(camOp, "trigger", root, "exe");
        else op.patch.link(rootMatrixOp, "trigger", root, "exe");

        loadMaterials(data, root);

        for (var i = 0; i < data.rootnode.children.length; i++)
        {
            if (data.rootnode.children[i])
            {
                let ntrigger = i + 2;
                if (ntrigger > 9)ntrigger = 9;

                if (hasMeshChildNode(data.rootnode.children[i]))
                    addChild(data, maxx - 2, 3, root, "trigger " + ntrigger, data.rootnode.children[i]);
            }
        }

        if (CABLES.UI)
        {
            setTimeout(function ()
            {
                gui.patchView.centerSelectOp(subPatchOpStart.id);
                // CABLES.CMD.PATCH.tidyChildOps();

                gui.patchView.updateSubPatches();
            }, 100);
            gui.patchView.updateSubPatches();
        }
    }
    else
    {
        if (CABLES.UI)
        {
            op.logError("remove child nodes first");
        }
    }
}

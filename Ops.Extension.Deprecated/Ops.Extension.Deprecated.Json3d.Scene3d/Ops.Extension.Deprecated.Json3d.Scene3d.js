let self = this;
let cgl = this.patch.cgl;

let scene = new CABLES.Variable();

cgl.tempData.currentScene = null;

this.exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
this.filename = this.addInPort(new CABLES.Port(this, "file", CABLES.OP_PORT_TYPE_VALUE, { "display": "file", "type": "string", "filter": "mesh" }));
const trigger = op.outTrigger("trigger");

let defaultEasing = CABLES.EASING_LINEAR;

let skipFrames = 1;
let frameNum = 0;
let cloneTransformStore = [];

function render()
{
    let oldScene = cgl.tempData.currentScene;
    cgl.tempData.currentScene = scene;
    if (cgl.tempData.currentScene.materials)cgl.tempData.currentScene.materials.length = 0;// cgl.tempData.currentScene.materials=[];

    cgl.tempData.cloneTransforms = cloneTransformStore;
    trigger.trigger();
    cgl.tempData.currentScene = oldScene;
}

this.exe.onTriggered = render;

let setPortAnimated = function (p, doLerp)
{
    p.setAnimated(true);
    if (doLerp)p.anim.defaultEasing = defaultEasing;
};

function loadMaterials(data, root)
{
    let posyAdd = self.uiAttribs.translate.y + 200;

    if (data.materials)
    {
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
                if (jsonMat.properties[j].key && jsonMat.properties[j].value && jsonMat.properties[j].key == "$clr.diffuse")
                {
                    posyAdd += 100;
                    setMatOp = self.patch.addOp("Ops.Json3d.SetMaterial", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": self.uiAttribs.translate.x + 300, "y": posyAdd + 50 } });

                    setMatOp.getPort("name").set(matName);
                    setMatOp.name = "Set Material " + matName;
                    self.patch.link(root, "trigger 0", setMatOp, "exe");

                    let matOp = self.patch.addOp("Ops.Gl.Phong.PhongMaterial", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": self.uiAttribs.translate.x + 350, "y": posyAdd } });
                    matOp.getPort("diffuse r").set(jsonMat.properties[j].value[0]);
                    matOp.getPort("diffuse g").set(jsonMat.properties[j].value[1]);
                    matOp.getPort("diffuse b").set(jsonMat.properties[j].value[2]);
                    matOp.uiAttribs.title = matOp.name = "Material " + matName;

                    self.patch.link(setMatOp, "material", matOp, "shader");

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
                        console.log("FOund cameratarget!");
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
        camSeq = self.patch.addOp("Ops.TimedSequence", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": self.uiAttribs.translate.x, "y": self.uiAttribs.translate.y + 50 } });
        self.patch.link(camSeq, "exe", self, "trigger");

        console.log("camera....");

        let camCount = 0;
        for (i in data.cameras)
        {
            let cam = getCamera(data.rootnode, data.cameras[i]);
            // console.log(cam);

            if (cam)
            {
                if (!cam.target)
                {
                    var camOp = self.patch.addOp("Ops.Gl.Matrix.QuaternionCamera", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": self.uiAttribs.translate.x + camCount * 200, "y": self.uiAttribs.translate.y + 100 } });
                    camOp.uiAttribs.title = camOp.name = "cam " + cam.cam.name;

                    var an = dataGetAnimation(data, cam.cam.name);
                    self.patch.link(camSeq, "trigger " + camCount, camOp, "render");
                    self.patch.link(camOp, "trigger", seq, "exe " + camCount);
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
                }
                else
                {
                    var camOp = self.patch.addOp("Ops.Gl.Matrix.LookatCamera", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": self.uiAttribs.translate.x + camCount * 150, "y": self.uiAttribs.translate.y + 100 } });
                    camOp.uiAttribs.title = camOp.name = "cam " + cam.cam.name;
                    // self.patch.link(camOp,'render',self,'trigger');

                    self.patch.link(camSeq, "trigger " + camCount, camOp, "render");
                    self.patch.link(camOp, "trigger", seq, "exe " + camCount);
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
                        console.log(cam);
                        camOp.getPort("centerX").set(cam.target.transformation[12]);
                        camOp.getPort("centerY").set(cam.target.transformation[13]);
                        camOp.getPort("centerZ").set(cam.target.transformation[14]);

                        op.log("target not animated", cam.target.transformation[3]);

                        // var cc=findCamTarget(data,cam.cam.name);
                        // op.log(cc);
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
function addChild(data, x, y, parentOp, parentPort, ch)
{
    if (ch.hasOwnProperty("transformation"))
    {
        maxx = Math.max(x, maxx) + 1;

        let posx = self.uiAttribs.translate.x + x * 130;
        // if(ch.children && ch.children.length>1) posx=posx+(ch.children.length+1)*130/2;// center
        let posy = self.uiAttribs.translate.y + y * 50;

        // if(ch.children)console.log('ch ',ch.name,ch.children.length);

        let prevOp = null;
        let posyAdd = 0;

        {
            // animation

            if (data.hasOwnProperty("animations"))
            {
                let an = dataGetAnimation(data, ch.name);
                if (an)
                {
                    if (an.positionkeys && an.positionkeys.length > 0)
                    {
                        posyAdd += 50;
                        let anTransOp = self.patch.addOp("Ops.Json3d.TranslateChannel", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });
                        anTransOp.uiAttribs.title = anTransOp.name = ch.name + " trans anim";
                        anTransOp.getPort("channel").set(ch.name);
                        self.patch.link(prevOp, "trigger", anTransOp, "render");

                        if (!prevOp)self.patch.link(parentOp, parentPort, anTransOp, "render");
                        prevOp = anTransOp;

                        // setPortAnimated(anTransOp.getPort('posX'),true);
                        // setPortAnimated(anTransOp.getPort('posY'),true);
                        // setPortAnimated(anTransOp.getPort('posZ'),true);

                        // frameNum=skipFrames;
                        // for(var k in an.positionkeys)
                        // {
                        //     if(frameNum%skipFrames==0)
                        //     {
                        //         anTransOp.getPort('posX').anim.setValue( an.positionkeys[k][0],an.positionkeys[k][1][0] );
                        //         anTransOp.getPort('posY').anim.setValue( an.positionkeys[k][0],an.positionkeys[k][1][1] );
                        //         anTransOp.getPort('posZ').anim.setValue( an.positionkeys[k][0],an.positionkeys[k][1][2] );
                        //     }
                        //     frameNum++;
                        // }
                    }

                    if (an.scalingkeys && an.scalingkeys.length > 0)
                    {
                        posyAdd += 50;
                        let anScaleOp = self.patch.addOp("Ops.Json3d.ScaleChannel", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });
                        anScaleOp.uiAttribs.title = anScaleOp.name = ch.name + " scale anim";
                        anScaleOp.getPort("channel").set(ch.name);
                        self.patch.link(prevOp, "trigger", anScaleOp, "render");

                        if (!prevOp)self.patch.link(parentOp, parentPort, anScaleOp, "render");
                        prevOp = anScaleOp;
                    }

                    if (an.rotationkeys && an.rotationkeys.length > 0)
                    {
                        // posyAdd+=50;
                        // var anRotOp=self.patch.addOp('Ops.Gl.Matrix.Quaternion',{"subPatch":op.uiAttribs.subPatch,"translate":{x:posx,y:posy+posyAdd}});
                        // anRotOp.uiAttribs.title=anRotOp.name=ch.name+' quat rot anim';
                        // self.patch.link(prevOp,'trigger',anRotOp,'render');

                        // if(!prevOp)self.patch.link(parentOp,parentPort,anRotOp,'render');
                        // prevOp=anRotOp;

                        // anRotOp.getPort('x').setAnimated(true);
                        // anRotOp.getPort('y').setAnimated(true);
                        // anRotOp.getPort('z').setAnimated(true);
                        // anRotOp.getPort('w').setAnimated(true);

                        // frameNum=skipFrames;
                        // for(var k in an.rotationkeys)
                        // {
                        //     if(frameNum%skipFrames==0)
                        //     {
                        //         anRotOp.getPort('x').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][1] );
                        //         anRotOp.getPort('y').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][2] );
                        //         anRotOp.getPort('z').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][3] );
                        //         anRotOp.getPort('w').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][0] );
                        //     }
                        //     frameNum++;
                        // }
                        posyAdd += 50;
                        let anRotOp = self.patch.addOp("Ops.Json3d.QuaternionChannel", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });
                        anRotOp.uiAttribs.title = anRotOp.name = ch.name + " quat rot anim";
                        anRotOp.getPort("channel").set(ch.name);
                        self.patch.link(prevOp, "trigger", anRotOp, "render");

                        if (!prevOp)self.patch.link(parentOp, parentPort, anRotOp, "render");
                        prevOp = anRotOp;
                    }
                }
            }
        }

        let sameMesh = true;
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
                    } // else { console.log(3); sameMesh=false; }

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

        if (!prevOp)
        {
            let transOp = self.patch.addOp("Ops.Gl.Matrix.MatrixMul", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy } });

            if (!ch.transposed)
            {
                ch.transposed = true;
                mat4.transpose(ch.transformation, ch.transformation);
            }
            transOp.getPort("matrix").set(ch.transformation);
            prevOp = transOp;

            self.patch.link(parentOp, parentPort, prevOp, "render");
            if (ch.name) transOp.uiAttribs.title = transOp.name = ch.name + " transform";
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

            console.log("useChildrenMeshes ", useChildrenMeshes);

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

                    let matOp = self.patch.addOp("Ops.Json3d.Material", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });
                    self.patch.link(prevOp, "trigger", matOp, "exe");
                    prevOp = matOp;

                    for (let j in jsonMat.properties)
                        if (jsonMat.properties[j].key && jsonMat.properties[j].value && jsonMat.properties[j].key == "?mat.name")
                            matOp.getPort("name").set(jsonMat.properties[j].value);
                }

                if (!sameMesh)
                {
                    // mesh
                    posyAdd += 50;
                    var meshOp = self.patch.addOp("Ops.Json3d.Mesh", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });
                    meshOp.index.val = index;
                    meshOp.uiAttribs.title = meshOp.name = ch.name + " Mesh";

                    self.patch.link(prevOp, "trigger", meshOp, "render");
                }
            }
        }

        if (ch.hasOwnProperty("children"))
        {
            console.log(ch.name + " children are clones: ", sameMesh);

            if (sameMesh)
            {
                posyAdd += 50;

                let clonedOp = self.patch.addOp("Ops.Json3d.ClonedMesh", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });

                clonedOp.getPort("transformations").set(cloneTransforms);

                cloneTransformStore.push(cloneTransforms);
                console.log(cloneTransformStore.length + " cloneTransformStore !!!");

                self.patch.link(prevOp, "trigger", clonedOp, "render");
                // self.patch.link(parentOp,parentPort,prevOp,'render');

                posyAdd += 50;

                var meshOp = self.patch.addOp("Ops.Json3d.Mesh", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": posx, "y": posy + posyAdd } });
                meshOp.index.val = ch.children[0].meshes[0];
                meshOp.uiAttribs.title = meshOp.name = "clone " + ch.name + " Mesh";
                meshOp.getPort("draw").set(false);

                self.patch.link(prevOp, "trigger", meshOp, "render");
                self.patch.link(clonedOp, "geom", meshOp, "geometry");
            }

            if (!sameMesh)
            {
                y++;
                for (i = 0; i < ch.children.length; i++)
                {
                    console.log("   child..." + i + "/" + ch.children.length);
                    let xx = maxx;
                    if (ch.children.length > 1)xx++;
                    addChild(data, xx, y, prevOp, "trigger", ch.children[i]);
                }
            }
        }
    }
}

let reload = function ()
{
    if (!self.filename.get()) return;

    function doLoad()
    {
        CABLES.ajax(
            self.patch.getFilePath(self.filename.get()),
            function (err, _data, xhr)
            {
                if (err)
                {
                    if (CABLES.UI)self.uiAttr({ "error": "could not load file..." });

                    console.error("ajax error:", err);
                    self.patch.loading.finished(loadingId);
                    return;
                }
                else
                {
                    if (CABLES.UI)self.uiAttr({ "error": null });
                }

                let data = null;

                try
                {
                    data = JSON.parse(_data);
                }
                catch (ex)
                {
                    if (CABLES.UI)self.uiAttr({ "error": "could not load file..." });
                    return;
                }
                scene.setValue(data);

                if (!trigger.isLinked())
                {
                    let root = self.patch.addOp("Ops.Sequence", { "subPatch": op.uiAttribs.subPatch, "translate": { "x": self.uiAttribs.translate.x, "y": self.uiAttribs.translate.y + 150 } });
                    let camOp = loadCameras(data, root);

                    if (camOp) self.patch.link(camOp, "trigger", root, "exe");
                    else self.patch.link(self, "trigger", root, "exe");

                    loadMaterials(data, root);

                    for (let i = 0; i < data.rootnode.children.length; i++)
                    {
                        if (data.rootnode.children[i])
                        {
                            let ntrigger = i + 1;
                            if (ntrigger > 9)ntrigger = 9;
                            addChild(data, maxx - 2, 3, root, "trigger " + ntrigger, data.rootnode.children[i]);
                        }
                    }
                }

                // render();
                self.patch.loading.finished(loadingId);
                if (CABLES.UI) gui.jobs().finish("loading3d" + loadingId);
            });
    }

    var loadingId = self.patch.loading.start("json3dScene", self.filename.get());
    if (CABLES.UI) gui.jobs().start({ "id": "loading3d" + loadingId, "title": "loading 3d data" }, doLoad);
    else doLoad();
};

this.filename.onChange = reload;

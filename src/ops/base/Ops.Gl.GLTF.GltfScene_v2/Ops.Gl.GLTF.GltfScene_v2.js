// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    dataPort = op.inString("data"),
    inExec = op.inTrigger("Render"),
    inFile = op.inUrl("glb File", [".glb"]),
    inRender = op.inBool("Draw", true),
    inCamera = op.inDropDown("Camera", ["None"], "None"),
    inShow = op.inTriggerButton("Show Structure"),
    inCenter = op.inSwitch("Center", ["None", "XYZ", "XZ"], "XYZ"),
    inRescale = op.inBool("Rescale", true),
    inRescaleSize = op.inFloat("Rescale Size", 2.5),

    inTime = op.inFloat("Time"),
    inTimeLine = op.inBool("Sync to timeline", false),
    inLoop = op.inBool("Loop", true),

    inNormFormat = op.inSwitch("Normals Format", ["XYZ", "X-ZY"], "XYZ"),
    inVertFormat = op.inSwitch("Vertices Format", ["XYZ", "XZ-Y"], "XYZ"),
    inCalcNormals = op.inBool("Calc Normals", false),

    inMaterials = op.inObject("Materials"),
    inHideNodes = op.inArray("Hide Nodes"),

    nextBefore = op.outTrigger("Render Before"),
    next = op.outTrigger("Next"),
    outGenerator = op.outString("Generator"),
    outVersion = op.outNumber("GLTF Version"),
    outAnimLength = op.outNumber("Anim Length", 0),
    outAnimTime = op.outNumber("Anim Time", 0),
    outJson = op.outObject("Json"),
    outPoints = op.outArray("BoundingPoints"),
    outBounds = op.outObject("Bounds"),
    outAnimFinished = op.outTrigger("Finished"),
    outLoaded = op.outBool("Loaded");

op.setPortGroup("Timing", [inTime, inTimeLine, inLoop]);

const le = true; // little endian
const cgl = op.patch.cgl;
inFile.onChange =
    inVertFormat.onChange =
    inCalcNormals.onChange =
    inNormFormat.onChange = reloadSoon;

let cam = null;
let boundingPoints = [];
let gltf = null;
let maxTime = 0;
let time = 0;
let needsMatUpdate = true;
let timedLoader = null;
let loadingId = null;
let data = null;
const scale = vec3.create();
let lastTime = 0;
let doCenter = false;

const boundsCenter = vec3.create();

inShow.onTriggered = printInfo;
dataPort.setUiAttribs({ "hideParam": true, "hidePort": true });
dataPort.onChange = loadData;
inHideNodes.onChange = hideNodesFromData;

op.setPortGroup("Transform", [inRescale, inRescaleSize, inCenter]);

inCenter.onChange = updateCenter;

function updateCamera()
{
    const arr = ["None"];
    if (gltf && gltf.json.cameras)
    {
        for (let i = 0; i < gltf.json.cameras.length; i++)
        {
            arr.push(gltf.json.cameras[i].name);
        }
    }
    inCamera.uiAttribs.values = arr;
}

function updateCenter()
{
    doCenter = inCenter.get() != "None";

    if (gltf && gltf.bounds)
    {
        boundsCenter.set(gltf.bounds.center);
        boundsCenter[0] = -boundsCenter[0];
        boundsCenter[1] = -boundsCenter[1];
        boundsCenter[2] = -boundsCenter[2];
        if (inCenter.get() == "XZ") boundsCenter[1] = -gltf.bounds.minY;
    }
}

inRescale.onChange = function ()
{
    inRescaleSize.setUiAttribs({ "greyout": !inRescale.get() });
};

inMaterials.onChange = function ()
{
    needsMatUpdate = true;
};

op.onDelete = function ()
{
    closeTab();
};

inTimeLine.onChange = function ()
{
    inTime.setUiAttribs({ "greyout": inTimeLine.get() });
};

inCamera.onChange = setCam;

function setCam()
{
    cam = null;
    if (!gltf) return;

    for (let i = 0; i < gltf.cams.length; i++)
    {
        if (gltf.cams[i].name == inCamera.get())cam = gltf.cams[i];
    }
}

inExec.onTriggered = function ()
{
    if (inTimeLine.get()) time = op.patch.timer.getTime();
    else time = Math.max(0, inTime.get());

    if (inLoop.get())
    {
        time %= maxTime;
        if (time < lastTime)outAnimFinished.trigger();
    }
    else
    {
        if (maxTime > 0 && time >= maxTime)outAnimFinished.trigger();
    }
    lastTime = time;

    cgl.pushModelMatrix();

    outAnimTime.set(time || 0);

    if (gltf && gltf.bounds)
    {
        if (inRescale.get())
        {
            const sc = inRescaleSize.get() / gltf.bounds.maxAxis;
            gltf.scale = sc;
            vec3.set(scale, sc, sc, sc);
            mat4.scale(cgl.mMatrix, cgl.mMatrix, scale);
        }
        if (doCenter)
        {
            mat4.translate(cgl.mMatrix, cgl.mMatrix, boundsCenter);
        }
    }

    cgl.tempData.currentScene = gltf;
    nextBefore.trigger();

    if (needsMatUpdate) updateMaterials();

    if (cam) cam.start(time);

    if (gltf && inRender.get())
    {
        gltf.time = time;

        if (gltf.bounds && cgl.shouldDrawHelpers(op))
        {
            if (CABLES.UI && gui.shouldDrawOverlay)cgl.pushShader(CABLES.GL_MARKER.getDefaultShader(cgl));
            else cgl.pushShader(CABLES.GL_MARKER.getSelectedShader(cgl));
            gltf.bounds.render(cgl);
            cgl.popShader();
        }

        for (let i = 0; i < gltf.nodes.length; i++)
            if (!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
    }

    next.trigger();
    cgl.tempData.currentScene = null;

    cgl.popModelMatrix();

    if (cam)cam.end();
};

function loadBin(addCacheBuster)
{
    if (!loadingId)loadingId = cgl.patch.loading.start("gltf" + inFile.get(), inFile.get());

    let url = op.patch.getFilePath(String(inFile.get()));
    if (addCacheBuster)url += "?rnd=" + CABLES.generateUUID();

    outLoaded.set(false);
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    closeTab();

    cgl.patch.loading.addAssetLoadingTask(() =>
    {
        oReq.onload = function (oEvent)
        {
            boundingPoints = [];

            maxTime = 0;
            const arrayBuffer = oReq.response;
            gltf = parseGltf(arrayBuffer);

            needsMatUpdate = true;
            op.refreshParams();
            outAnimLength.set(maxTime);
            hideNodesFromData();
            if (tab)printInfo();

            updateCamera();
            setCam();
            outPoints.set(boundingPoints);
            if (gltf)
            {
                op.setUiAttrib({ "extendTitle": CABLES.basename(inFile.get()) });

                gltf.loaded = Date.now();
                if (gltf.bounds)outBounds.set(gltf.bounds);
            }
            updateCenter();
            outLoaded.set(true);

            cgl.patch.loading.finished(loadingId);
            loadingId = null;

            gltf.chunks = null;

            // op.log("finished loading gltf");
        };

        oReq.send(null);
    });
}

op.onFileChanged = function (fn)
{
    if (fn && fn.length > 3 && inFile.get() && inFile.get().indexOf(fn) > -1) reloadSoon(true);
};

op.onFileChanged = function (fn)
{
    if (inFile.get() && inFile.get().indexOf(fn) > -1)
    {
        reloadSoon(true);
    }
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function () { loadBin(nocache); }, 30);
}

function updateMaterials()
{
    if (!gltf) return;

    gltf.shaders = {};

    for (let j = 0; j < inMaterials.links.length; j++)
    {
        const op = inMaterials.links[j].portOut.parent;
        const portShader = op.getPort("Shader");
        const portName = op.getPort("Material Name");

        if (portShader && portName && portShader.get())
        {
            const name = portName.get();
            if (gltf.json.materials)
                for (let i = 0; i < gltf.json.materials.length; i++)
                    if (gltf.json.materials[i].name == name)
                    {
                        if (gltf.shaders[i])
                        {
                            op.warn("double material assignment:", name);
                        }
                        gltf.shaders[i] = portShader.get();
                    }
        }
    }
    needsMatUpdate = false;
    if (tab)printInfo();
}

function hideNodesFromArray()
{
    const hideArr = inHideNodes.get();

    if (!gltf || !data || !data.hiddenNodes) return;
    if (!hideArr)
    {
        return;
    }

    for (let i = 0; i < hideArr.length; i++)
    {
        const n = gltf.getNode(hideArr[i]);
        if (n)n.hidden = true;
    }
}

function hideNodesFromData()
{
    if (!data)loadData();
    if (!gltf) return;

    gltf.unHideAll();

    if (data && data.hiddenNodes)
    {
        for (const i in data.hiddenNodes)
        {
            const n = gltf.getNode(i);
            if (n) n.hidden = true;
            else op.warn("node to be hidden not found", i, n);
        }
    }
    hideNodesFromArray();
}

function loadData()
{
    data = dataPort.get();

    if (!data || data === "")data = {};
    else data = JSON.parse(data);

    if (gltf)hideNodesFromData();

    return data;
}

function saveData()
{
    dataPort.set(JSON.stringify(data));
}

function findParents(nodes, childNodeIndex)
{
    for (let i = 0; i < gltf.nodes.length; i++)
    {
        if (gltf.nodes[i].children.indexOf(childNodeIndex) >= 0)
        {
            nodes.push(gltf.nodes[i]);
            if (gltf.nodes[i].isChild) findParents(nodes, i);
        }
    }
}

op.exposeTexture = function (name)
{
    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfTexture");
    newop.getPort("Name").set(name);
    op.patch.link(op, next.name, newop, "Render");
    gui.patchView.centerSelectOp(newop.id, true);
};

function setNewOpPosition(newOp, num)
{
    num = num || 1;

    newOp.setUiAttrib({ "translate": { "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y + num * 50 } });
}

op.exposeNode = function (name, tree)
{
    if (tree)
    {
        for (let i = 0; i < gltf.nodes.length; i++)
        {
            if (gltf.nodes[i].name == name)
            {
                const node = gltf.nodes[i];
                const arrHierarchy = [];
                findParents(arrHierarchy, i);

                arrHierarchy.push(node, node);

                let prevPort = next.name;
                let prevOp = op;
                for (let j = 0; j < arrHierarchy.length; j++)
                {
                    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfNode_v2");
                    newop.getPort("Node Name").set(arrHierarchy[j].name);
                    op.patch.link(prevOp, prevPort, newop, "Render");
                    setNewOpPosition(newop, j);

                    if (j == arrHierarchy.length - 1)
                    {
                        newop.getPort("Transformation").set(false);
                    }
                    else
                    {
                        newop.getPort("Draw Mesh").set(false);
                        newop.getPort("Draw Childs").set(false);
                    }

                    prevPort = "Next";
                    prevOp = newop;
                }
            }
        }
    }
    else
    {
        const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfNode_v2");
        newop.getPort("Node Name").set(name);
        setNewOpPosition(newop);
        op.patch.link(op, next.name, newop, "Render");
        gui.patchView.centerSelectOp(newop.id, true);
    }
    gui.closeModal();
};

op.assignMaterial = function (name)
{
    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfSetMaterial");
    newop.getPort("Material Name").set(name);
    op.patch.link(op, inMaterials.name, newop, "Material");
    gui.patchView.centerSelectOp(newop.id, true);
    gui.closeModal();
};

op.toggleNodeVisibility = function (name)
{
    const n = gltf.getNode(name);
    n.hidden = !n.hidden;
    data.hiddenNodes = data.hiddenNodes || {};

    if (n)
        if (n.hidden)data.hiddenNodes[name] = true;
        else delete data.hiddenNodes[name];

    saveData();
};

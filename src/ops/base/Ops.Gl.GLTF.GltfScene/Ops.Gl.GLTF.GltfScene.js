// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    dataPort = op.inString("data"),
    inExec = op.inTrigger("Render"),
    inFile = op.inUrl("glb File"),
    inRender = op.inBool("Draw", true),
    inAutoSize = op.inBool("Auto Scale", true),
    inShow = op.inTriggerButton("Show Structure"),
    inTime = op.inFloat("Time"),
    inTimeLine = op.inBool("Sync to timeline", false),
    inLoop = op.inBool("Loop", true),

    inMaterials = op.inObject("Materials"),
    nextBefore = op.outTrigger("Render Before"),
    next = op.outTrigger("Next"),
    outGenerator = op.outString("Generator"),
    outVersion = op.outNumber("GLTF Version"),
    outAnimLength = op.outNumber("Anim Length", 0),
    outAnimTime = op.outNumber("Anim Time", 0),
    outJson = op.outObject("Json"),
    outAnimFinished = op.outTrigger("Finished");

op.setPortGroup("Timing", [inTime, inTimeLine, inLoop]);

const le = true; // little endian
const cgl = op.patch.cgl;
inFile.onChange = reloadSoon;

let gltf = null;
let maxTime = 0;
let time = 0;
let needsMatUpdate = true;
let timedLoader = null;
let loadingId = null;
let data = null;
const scale = vec3.create();
let lastTime = 0;

inShow.onTriggered = printInfo;
dataPort.setUiAttribs({ "hideParam": true, "hidePort": true });
dataPort.onChange = loadData;

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

    outAnimTime.set(time);

    if (gltf && gltf.bounds && inAutoSize.get())
    {
        const sc = 2.5 / gltf.bounds.maxAxis;
        vec3.set(scale, sc, sc, sc);
        mat4.scale(cgl.mMatrix, cgl.mMatrix, scale);
    }

    cgl.tempData.currentScene = gltf;
    nextBefore.trigger();

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

        if (needsMatUpdate) updateMaterials();
        for (let i = 0; i < gltf.nodes.length; i++)
            if (!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
    }

    next.trigger();
    cgl.tempData.currentScene = null;

    cgl.popModelMatrix();
};

function loadBin()
{
    if (!loadingId)loadingId = cgl.patch.loading.start("gltf", inFile.get(), op);

    const url = op.patch.getFilePath(String(inFile.get()));
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    closeTab();
    op.setUiAttrib({ "extendTitle": null });


    oReq.onload = function (oEvent)
    {
        op.setUiAttrib({ "extendTitle": CABLES.basename(inFile.get()) });


        maxTime = 0;
        const arrayBuffer = oReq.response;
        gltf = parseGltf(arrayBuffer);
        cgl.patch.loading.finished(loadingId);
        loadingId = null;
        needsMatUpdate = true;
        op.refreshParams();
        outAnimLength.set(maxTime);
        hideNodesFromData();
        if (tab)printInfo();
        console.log("gltf.bounds", gltf.bounds);
    };


    oReq.send(null);
}

op.onFileChanged = function (fn)
{
    if (fn && fn.length > 3 && inFile.get() && inFile.get().indexOf(fn) > -1) reloadSoon();
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        loadBin();
    }, 30);
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
                            console.log("double material assignment:", name);
                        }
                        gltf.shaders[i] = portShader.get();
                    }
        }
    }
    needsMatUpdate = false;
    if (tab)printInfo();
}

function hideNodesFromData()
{
    if (!data)loadData();

    if (gltf && data && data.hiddenNodes)
    {
        for (const i in data.hiddenNodes)
        {
            const n = gltf.getNode(i);
            if (n) n.hidden = true;
            else op.warn("node to be hidden not found", i, n);
        }
    }
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


op.exposeNode = function (name)
{
    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfNode");
    newop.getPort("Node Name").set(name);
    op.patch.link(op, next.name, newop, "Render");
    gui.patchView.centerSelectOp(newop.id, true);
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

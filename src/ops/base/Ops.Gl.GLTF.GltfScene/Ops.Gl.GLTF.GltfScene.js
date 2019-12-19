// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    dataPort=op.inString("data"),
    inExec=op.inTrigger("Render"),
    inFile=op.inUrl("glb File"),
    inRender=op.inBool("Draw",true),
    inAutoSize=op.inBool("Auto Scale",true),
    inShow=op.inTriggerButton("Show Structure"),
    inTime=op.inFloat("Time"),
    inTimeLine=op.inBool("Sync to timeline",false),
    inLoop=op.inBool("Loop",true),

    inMaterials=op.inObject("Materials"),
    next=op.outTrigger("Next"),
    outGenerator=op.outString("Generator"),
    outVersion=op.outNumber("GLTF Version"),
    outAnimLength=op.outNumber("Anim Length",0),
    outAnimTime=op.outNumber("Anim Time",0),
    outAnimFinished=op.outTrigger("Finished");

op.setPortGroup("Timing",[inTime,inTimeLine,inLoop]);

const le=true; //little endian
const cgl=op.patch.cgl;
inFile.onChange=reloadSoon;

var gltf=null;
var maxTime=0;
var time=0;
var needsMatUpdate=true;
var timedLoader=null;
var loadingId=null;
var data=null;
var scale=vec3.create();
var lastTime=0;


inMaterials.onChange=function()
{
    needsMatUpdate=true;
};

inShow.onTriggered=printInfo;
dataPort.setUiAttribs({"hideParam":true,"hidePort":true});
dataPort.onChange=loadData;


inTimeLine.onChange=function()
{
    inTime.setUiAttribs({greyout:inTimeLine.get()});
};


inExec.onTriggered=function()
{
    if(inTimeLine.get()) time=op.patch.timer.getTime();
    else time=Math.max(0,inTime.get());



    if(inLoop.get())
    {
        time = time % maxTime;
        if(time<lastTime)outAnimFinished.trigger();
    }
    else
    {
        if(maxTime >0 && time>=maxTime)outAnimFinished.trigger();
    }
    lastTime=time;

    cgl.pushModelMatrix();

    outAnimTime.set(time);

    if(gltf && gltf.bounds && inAutoSize.get())
    {
        const sc=2.5/gltf.bounds.maxAxis;
        vec3.set(scale,sc,sc,sc);
        mat4.scale(cgl.mMatrix,cgl.mMatrix,scale);
    }

    if(gltf && inRender.get())
    {
        gltf.time=time;

        if(gltf.bounds && CABLES.UI && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op)))
        {
            if(CABLES.UI.renderHelper)cgl.setShader(CABLES.GL_MARKER.getDefaultShader(cgl));
            else cgl.setShader(CABLES.GL_MARKER.getSelectedShader(cgl));
            gltf.bounds.render(cgl);
            cgl.setPreviousShader();
        }

        if(needsMatUpdate) updateMaterials();
        for(var i=0;i<gltf.nodes.length;i++)
            if(!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
    }

    cgl.frameStore.currentScene=gltf;
    next.trigger();
    cgl.frameStore.currentScene=null;

    cgl.popModelMatrix();
};

function loadBin()
{
    if(!loadingId)loadingId=cgl.patch.loading.start('gltf',inFile.get());

    var oReq = new XMLHttpRequest();
    oReq.open("GET", inFile.get(), true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent)
    {
        maxTime=0;
        var arrayBuffer = oReq.response;
        gltf=parseGltf(arrayBuffer);
        cgl.patch.loading.finished(loadingId);
        needsMatUpdate=true;
        op.refreshParams();
        outAnimLength.set(maxTime);
        hideNodesFromData();
    };

    oReq.send(null);
}

op.onFileChanged=function(fn)
{
    if(inFile.get() && inFile.get().indexOf(fn)>-1) reloadSoon();

};


function reloadSoon(nocache)
{

    clearTimeout(timedLoader);
    timedLoader=setTimeout(function()
    {
        loadBin();
    },30);
}


function updateMaterials()
{
    if(!gltf) return;

    gltf.shaders={};

    for(var j=0;j<inMaterials.links.length;j++)
    {
        const op=inMaterials.links[j].portOut.parent;
        const portShader=op.getPort("Shader");
        const portName=op.getPort("Material Name");

        if(portShader && portName && portShader.get())
        {
            const name=portName.get();
            if(gltf.json.materials)
                for(var i=0;i<gltf.json.materials.length;i++)
                    if(gltf.json.materials[i].name==name) gltf.shaders[i]=portShader.get();
        }
    }
    needsMatUpdate=false;
}


function hideNodesFromData()
{
    if(!data)loadData();

    if(data && data.hiddenNodes)
    {
        for(var i in data.hiddenNodes)
        {
            const n=gltf.getNode(i);
            if(n) n.hidden=true;
            else op.warn("node to be hidden not found",i,n);
        }
    }
}


function loadData()
{
    data=dataPort.get()

    if(!data || data==="")data={};
    else data=JSON.parse(data);

    if(gltf)hideNodesFromData();

    return data;
}

function saveData()
{
    dataPort.set(JSON.stringify(data));
}

op.assignMaterial=function(name)
{
    var newop=gui.patch().scene.addOp("Ops.Gl.GltfSetMaterial");
    newop.getPort("Material Name").set(name);
    op.patch.link(op,inMaterials.name,newop,"Material");
    gui.patch().focusOp(newop.id,true);
    CABLES.UI.MODAL.hide();
};

op.toggleNodeVisibility=function(name)
{
    const n=gltf.getNode(name);

    n.hidden=!n.hidden;

    data.hiddenNodes=data.hiddenNodes||{};

    if(n)
        if(n.hidden)data.hiddenNodes[name]=true;
        else delete data.hiddenNodes[name];

    saveData();
}




// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    dataPort=op.inString("data"),
    inExec=op.inTrigger("Render"),
    inFile=op.inUrl("glb File"),
    inRender=op.inBool("Draw",true),
    inCenter=op.inSwitch("Center",["None","XYZ","XZ"],"XYZ"),
    inRescale=op.inBool("Rescale",true),
    inRescaleSize=op.inFloat("Rescale Size",2.5),
    inShow=op.inTriggerButton("Show Structure"),
    inTime=op.inFloat("Time"),
    inTimeLine=op.inBool("Sync to timeline",false),
    inLoop=op.inBool("Loop",true),

    inSwitchNormalsYZ=op.inBool("Switch Normals",false),

    inMaterials=op.inObject("Materials"),


    nextBefore=op.outTrigger("Render Before"),
    next=op.outTrigger("Next"),
    outGenerator=op.outString("Generator"),
    outVersion=op.outNumber("GLTF Version"),
    outAnimLength=op.outNumber("Anim Length",0),
    outAnimTime=op.outNumber("Anim Time",0),
    outJson=op.outObject("Json"),
    outPoints=op.outArray("BoundingPoints"),
    outBounds=op.outObject("Bounds"),
    outAnimFinished=op.outTrigger("Finished");

op.setPortGroup("Timing",[inTime,inTimeLine,inLoop]);

const le=true; //little endian
const cgl=op.patch.cgl;
inFile.onChange=reloadSoon;

var boundingPoints=[];
var gltf=null;
var maxTime=0;
var time=0;
var needsMatUpdate=true;
var timedLoader=null;
var loadingId=null;
var data=null;
var scale=vec3.create();
var lastTime=0;
var doCenter=false;

const boundsCenter=vec3.create();

inShow.onTriggered=printInfo;
dataPort.setUiAttribs({"hideParam":true,"hidePort":true});
dataPort.onChange=loadData;

op.setPortGroup("Transform",[inRescale,inRescaleSize,inCenter]);

inCenter.onChange=function()
{
    doCenter=inCenter.get()!="None";
    updateCenter();

};

function updateCenter()
{

    if(gltf && gltf.bounds)
    {
        boundsCenter.set(gltf.bounds.center);
        boundsCenter[0]=-boundsCenter[0];
        boundsCenter[1]=-boundsCenter[1];
        boundsCenter[2]=-boundsCenter[2];

        if(inCenter.get()=="XZ")
            boundsCenter[1]=-gltf.bounds.minY;
    }
}


inSwitchNormalsYZ.onChange=function()
{
    reloadSoon();
};

inRescale.onChange=function()
{
    inRescaleSize.setUiAttribs({greyout:!inRescale.get()});
};

inMaterials.onChange=function()
{
    needsMatUpdate=true;
};

op.onDelete=function()
{
    closeTab();
};

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

    outAnimTime.set(time||0);

    if(gltf && gltf.bounds)
    {
        if(inRescale.get())
        {
            const sc=inRescaleSize.get()/gltf.bounds.maxAxis;
            vec3.set(scale,sc,sc,sc);
            // console.log(sc,sc,sc);
            mat4.scale(cgl.mMatrix,cgl.mMatrix,scale);
        }
        if(doCenter)
        {
            mat4.translate(cgl.mMatrix,cgl.mMatrix,boundsCenter);
        }
    }

    cgl.frameStore.currentScene=gltf;
    nextBefore.trigger();

    if(needsMatUpdate) updateMaterials();

    if(gltf && inRender.get())
    {
        gltf.time=time;

        if(gltf.bounds && CABLES.UI && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op)))
        {
            if(CABLES.UI.renderHelper)cgl.pushShader(CABLES.GL_MARKER.getDefaultShader(cgl));
            else cgl.pushShader(CABLES.GL_MARKER.getSelectedShader(cgl));
            gltf.bounds.render(cgl);
            cgl.popShader();
        }

        for(var i=0;i<gltf.nodes.length;i++)
            if(!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
    }

    next.trigger();
    cgl.frameStore.currentScene=null;

    cgl.popModelMatrix();
};

function loadBin(addCacheBuster)
{
    if(!loadingId)loadingId=cgl.patch.loading.start('gltf',inFile.get());

    var url = op.patch.getFilePath(String(inFile.get()));
    if(addCacheBuster)url+='?rnd='+CABLES.generateUUID();

    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";
    closeTab();

    oReq.onload = function (oEvent)
    {
        boundingPoints=[];

        maxTime=0;
        var arrayBuffer = oReq.response;
        gltf=parseGltf(arrayBuffer);
        cgl.patch.loading.finished(loadingId);
        needsMatUpdate=true;
        op.refreshParams();
        outAnimLength.set(maxTime);
        hideNodesFromData();
        if(tab)printInfo();


        outPoints.set(boundingPoints);
        outBounds.set(gltf.bounds);
        updateCenter();
    };

    oReq.send(null);
}

op.onFileChanged=function(fn)
{

    if(fn && fn.length>3 && inFile.get() && inFile.get().indexOf(fn)>-1) reloadSoon(true);

};

op.onFileChanged=function(fn)
{
    if(inFile.get() && inFile.get().indexOf(fn)>-1)
    {
        reloadSoon(true);
    }
};


function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader=setTimeout(function(){ loadBin(nocache); },30);
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
                    if(gltf.json.materials[i].name==name)
                    {
                        if(gltf.shaders[i])
                        {
                            op.warn("double material assignment:",name);
                        }
                        gltf.shaders[i]=portShader.get();
                    }
        }
    }
    needsMatUpdate=false;
    if(tab)printInfo();

}

function hideNodesFromData()
{
    if(!data)loadData();

    if(gltf && data && data.hiddenNodes)
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

op.exposeNode=function(name)
{
    var newop=gui.patch().scene.addOp("Ops.Gl.GLTF.GltfNode");
    newop.getPort("Node Name").set(name);
    op.patch.link(op,next.name,newop,"Render");
    gui.patch().focusOp(newop.id,true);
    CABLES.UI.MODAL.hide();
};

op.assignMaterial=function(name)
{
    var newop=gui.patch().scene.addOp("Ops.Gl.GLTF.GltfSetMaterial");
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




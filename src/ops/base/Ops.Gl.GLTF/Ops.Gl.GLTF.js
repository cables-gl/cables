// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    inExec=op.inTrigger("Render"),
    inFile=op.inUrl("glb File"),
    inTime=op.inFloat("Time"),
    inTimeLine=op.inBool("Sync to timeline"),
    inMaterials=op.inObject("Materials"),
    inMaterialList=op.inDropDown("Material List",[]),
    inMaterialCreate=op.inTriggerButton("Assign Material"),
    next=op.outTrigger("Next"),
    outGenerator=op.outString("Generator"),
    outVersion=op.outNumber("Version");

op.setPortGroup("Timing",[inTime,inTimeLine]);
op.setPortGroup("Material Mapping",[inMaterials,inTimeLine]);

const selectMatStr="Select a material...";
const le=true; //little endian
const cgl=op.patch.cgl;
inFile.onChange=reloadSoon;

var gltf=null;
var maxTime=0;
var time=0;
var needsMatUpdate=true;
var timedLoader=null;
var loadingId=null;

inMaterials.onLinkChanged=inMaterials.onChange=function()
{
    needsMatUpdate=true;
};

inTimeLine.onChange=function()
{
    inTime.setUiAttribs({greyout:inTimeLine.get()});
};

inExec.onTriggered=function()
{
    if(inTimeLine.get()) time=op.patch.timer.getTime();
    else time=Math.max(0,inTime.get())%maxTime;

    if(gltf)
    {
        if(needsMatUpdate) updateMaterials();
        for(var i=0;i<gltf.nodes.length;i++)
            if(!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
    }

    cgl.frameStore.currentScene=gltf;
    next.trigger();
    cgl.frameStore.currentScene=null;
};

function loadBin()
{
    if(!loadingId)loadingId=cgl.patch.loading.start('gltf',inFile.get());

    var oReq = new XMLHttpRequest();
    oReq.open("GET", inFile.get(), true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent)
    {
        var arrayBuffer = oReq.response;
        gltf=parseGltf(arrayBuffer);
        cgl.patch.loading.finished(loadingId);
        needsMatUpdate=true;

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

inMaterialList.onChange=updateMaterialCreateButton;

function updateMaterialCreateButton()
{
    if(!op.patch.isEditorMode())return;

    if(!gltf || !gltf.json || !gltf.json.materials || gltf.json.materials.length===0)
    {
        if(gltf)console.log("NO MATERIALS!!!",gltf.json);
        inMaterialList.uiAttribs.values=["no materials"];
        inMaterialList.setUiAttribs({"greyout":true});
        inMaterialCreate.setUiAttribs({"greyout":true});
        return;
    }

    inMaterialList.setUiAttribs({"greyout":false});
    inMaterialCreate.setUiAttribs({"greyout":inMaterialList.get()==selectMatStr});
}

inMaterialCreate.onTriggered=function()
{
    if(op.patch.isEditorMode())
    {
        var newop=gui.patch().scene.addOp("Ops.Gl.GltfSetMaterial");
        newop.getPort("Material Name").set(inMaterialList.get());
        op.patch.link(op,inMaterials.name,newop,"Material");
    }
};

function updateMaterials()
{
    if(!gltf)
    {
        updateMaterialCreateButton();
        return;
    }

    gltf.shaders={};

    for(var j=0;j<inMaterials.links.length;j++)
    {
        const op=inMaterials.links[j].portOut.parent;
        const portShader=op.getPort("Shader");
        const portName=op.getPort("Material Name");

        if(portShader && portName && portShader.get())
        {
            const name=portName.get();
            const matNames=[selectMatStr];

            if(gltf.json.materials)
                for(var i=0;i<gltf.json.materials.length;i++)
                {
                    matNames.push(gltf.json.materials[i].name);

                    if(gltf.json.materials[i].name==name)
                        gltf.shaders[i]=portShader.get();
                }

            inMaterialList.uiAttribs.values=matNames;
            inMaterialList.set(selectMatStr);
        }
    }

    updateMaterialCreateButton();
    needsMatUpdate=false;
}










// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    inExec=op.inTrigger("Render"),
    inFile=op.inUrl("glb File"),
    inRender=op.inBool("Draw",true),
    inAutoSize=op.inBool("Auto Scale",true),
    inTime=op.inFloat("Time"),
    inTimeLine=op.inBool("Sync to timeline"),
    inMaterialList=op.inDropDown("Material List",[]),
    inMaterialCreate=op.inTriggerButton("Assign Material"),
    inMaterials=op.inObject("Materials"),
    inNodeList=op.inDropDown("Node List",[]),
    inNodeCreate=op.inTriggerButton("Expose Node"),
    next=op.outTrigger("Next"),
    outGenerator=op.outString("Generator"),
    outVersion=op.outNumber("Version");

op.setPortGroup("Timing",[inTime,inTimeLine]);
op.setPortGroup("Material Mapping",[inMaterialList,inMaterialCreate,inMaterials]);
op.setPortGroup("Expose Nodes",[inNodeList,inNodeCreate]);

const selectMatStr="Select a material...";
const selectNodeStr="Select a node...";
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


var scale=vec3.create();

inExec.onTriggered=function()
{
    if(inTimeLine.get()) time=op.patch.timer.getTime();
    else time=Math.max(0,inTime.get())%maxTime;

    cgl.pushModelMatrix();

    if(gltf && inRender.get())
    {

        if(gltf.bounds && inAutoSize.get())
        {
            const sc=3/gltf.bounds.maxAxis;
            vec3.set(scale,sc,sc,sc);
            mat4.scale(cgl.mMatrix,cgl.mMatrix,scale);
        }

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
        var arrayBuffer = oReq.response;
        gltf=parseGltf(arrayBuffer);
        cgl.patch.loading.finished(loadingId);
        needsMatUpdate=true;
        updateDropdowns();
        op.refreshParams();
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
inNodeList.onChange=updateMaterialCreateButton;

function updateMaterialCreateButton()
{
    // if(!op.patch.isEditorMode())return;

    // if(!gltf || !gltf.json || !gltf.json.materials || gltf.json.materials.length===0)
    // {
    //     if(gltf) console.log("NO MATERIALS!!!",gltf.json);
    //     inMaterialList.uiAttribs.values=["no materials"];
    //     inMaterialList.setUiAttribs({"greyout":true});
    //     inMaterialCreate.setUiAttribs({"greyout":true});

    //     inNodeList.setUiAttribs({"greyout":true});
    //     inNodeCreate.setUiAttribs({"greyout":true});
    //     return;
    // }

    // inMaterialList.setUiAttribs({"greyout":false});
    // inMaterialCreate.setUiAttribs({"greyout":inMaterialList.get()==selectMatStr});

    // inNodeList.setUiAttribs({"greyout":false});
    // inNodeCreate.setUiAttribs({"greyout":inNodeList.get()==selectMatStr});

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


    console.log("update material list");


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

    updateDropdowns();
    updateMaterialCreateButton();
    needsMatUpdate=false;
}


function updateDropdowns()
{
    // material list

    const matNames=[selectMatStr];

    if(gltf.json.materials)
        for(var i=0;i<gltf.json.materials.length;i++)
            matNames.push(gltf.json.materials[i].name);

    inMaterialList.uiAttribs.values=matNames;
    inMaterialList.set(selectMatStr);

    // node list

    const nodeNames=[selectNodeStr];

    for(var i=0;i<gltf.nodes.length;i++)
        nodeNames.push(gltf.nodes[i].name||'unnamed node '+i);

    inNodeList.uiAttribs.values=nodeNames;
    inMaterialList.set(selectNodeStr);
}










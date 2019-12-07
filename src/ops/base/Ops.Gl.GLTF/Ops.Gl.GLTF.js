// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    inExec=op.inTrigger("Render"),
    inFile=op.inUrl("glb File"),
    inTime=op.inFloat("Time"),
    inMaterials=op.inObject("Materials"),
    next=op.outTrigger("Next"),
    outGenerator=op.outString("Generator"),
    outVersion=op.outNumber("Version");

const le=true; //little endian
const CHUNK_HEADER_SIZE=8;
const cgl=op.patch.cgl;
inFile.onChange=loadBin;



var gltf=null;
var maxTime=0;
var time=2.2;
var needsMatUpdate=true;

inMaterials.onLinkChanged=inMaterials.onChange=function()
{
    needsMatUpdate=true;
};

inExec.onTriggered=function()
{
    time=Math.max(0,inTime.get())%maxTime;
    if(gltf)
    {
        if(needsMatUpdate) updateMaterials();

        for(var i=0;i<gltf.nodes.length;i++)
        {
            if(!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
        }

    }

    cgl.frameStore.currentScene=gltf;
    next.trigger();
    cgl.frameStore.currentScene=null;
};

function loadBin()
{
    var oReq = new XMLHttpRequest();
    oReq.open("GET", inFile.get(), true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent)
    {
        var arrayBuffer = oReq.response;
        gltf=parseGltf(arrayBuffer);
    };

    oReq.send(null);
}

op.onFileChanged=function(fn)
{
    if(inFile.get() && inFile.get().indexOf(fn)>-1)
    {
        loadBin(true);
    }
};

function updateMaterials()
{
    if(!gltf)return;
    gltf.shaders={};

    for(var j=0;j<inMaterials.links.length;j++)
    {
        // console.log(inMaterials.links[j]);
        // console.log(inMaterials.links[j].portOut.parent);

        const op=inMaterials.links[j].portOut.parent;
        const portShader=op.getPort("Shader");
        const portName=op.getPort("Material Name");

        if(portShader && portName && portShader.get())
        {
            const name=portName.get();

            for(var i=0;i<gltf.json.materials.length;i++)
            {
                if(gltf.json.materials[i].name==name)
                {
                    gltf.shaders[i]=portShader.get();
                }

                // var node=new gltfNode(gltf.json.nodes[i],gltf);
                // gltf.nodes.push(node);
            }

        }


    }

    needsMatUpdate=false;

}










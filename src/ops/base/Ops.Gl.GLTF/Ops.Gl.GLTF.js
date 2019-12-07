// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    inExec=op.inTrigger("Render"),
    inFile=op.inUrl("glb File"),
    inTime=op.inFloat("Time"),
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

inExec.onTriggered=function()
{
    time=Math.max(0,inTime.get())%maxTime;
    if(gltf)
        for(var i=0;i<gltf.nodes.length;i++)
        {
            if(!gltf.nodes[i].isChild) gltf.nodes[i].render(cgl);
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

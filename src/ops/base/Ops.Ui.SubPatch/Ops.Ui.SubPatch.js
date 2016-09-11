op.name="SubPatch";

var dyn=op.addInPort(new Port(op,"create port",OP_PORT_TYPE_DYNAMIC));
var dynOut=op.addOutPort(new Port(op,"create port out",OP_PORT_TYPE_DYNAMIC));

var dataStr=op.addInPort(new Port(op,"dataStr",OP_PORT_TYPE_VALUE,{ display:'readonly' }));
op.patchId=op.addInPort(new Port(op,"patchId",OP_PORT_TYPE_VALUE,{ display:'readonly' }));

var data={"ports":[],"portsOut":[]};

if(!Ops.Ui.Patch.maxPatchId)Ops.Ui.Patch.maxPatchId=0;
op.patchId.set(Ops.Ui.Patch.maxPatchId+1);
getSubPatchInputOp();
getSubPatchOutputOp();

var dataLoaded=false;
dataStr.onChange=function()
{
    if(dataLoaded)return;
    op.log('load data....'+dataStr.get());
    
    if(!dataStr.get())return;
    try
    {
        data=JSON.parse(dataStr.get());
        setupPorts();
    }
    catch(e)
    {
        op.log('cannot load subpatch data...');
        console.log(e);
    }
};

function saveData()
{
    dataStr.set(JSON.stringify(data));
    console.log("save",data);
}

function addPortListener(newPort,newPortInPatch)
{
    if(newPort.type==OP_PORT_TYPE_FUNCTION)
    {
        newPort.onTriggered=function()
        {
            newPortInPatch.trigger();
        };
    }
    else
    {
        newPort.onChange=function()
        {
            newPortInPatch.set(newPort.get());
        };
    }
}

function setupPorts()
{
    var ports=data.ports;
    var portsOut=data.portsOut;
    
    for(var i=0;i<ports.length;i++)
    {
        op.log('add subpatch port');
        
        if(!op.getPortByName(ports[i].name))
        {
            var newPort=op.addInPort(new Port(op,ports[i].name,ports[i].type));
            var patchInputOp=getSubPatchInputOp();
            var newPortInPatch=patchInputOp.addOutPort(new Port(patchInputOp,ports[i].name,ports[i].type));
            
            addPortListener(newPort,newPortInPatch);
        }
        dataLoaded=true;
    }

    for(var i=0;i<portsOut.length;i++)
    {
        op.log('add subpatch port OUT');
        
        if(!op.getPortByName(portsOut[i].name))
        {
            var newPort=op.addOutPort(new Port(op,portsOut[i].name,portsOut[i].type));
            var patchInputOp=getSubPatchOutputOp();
            var newPortInPatch=patchInputOp.addInPort(new Port(patchInputOp,portsOut[i].name,portsOut[i].type));
            
            addPortListener(newPortInPatch,newPort);
        }
        dataLoaded=true;
    }
}




dyn.onLinkChanged=function()
{
    if(dyn.isLinked())
    {
        op.log('dyn link');
        setTimeout(function()
        {
            var otherPort=dyn.links[0].getOtherPort(dyn);
            dyn.removeLinks();
            var newName="in"+data.ports.length+" "+otherPort.parent.name+" "+otherPort.name;
            
            data.ports.push({"name":newName,"type":otherPort.type});
            
            setupPorts();

            gui.scene().link(
                otherPort.parent,
                otherPort.getName(),
                op,
                newName
                );

            dataLoaded=true;
            saveData();
            
        },100);
    }
    else
    {
        op.log('dyn unlinked...');
    }
};

dynOut.onLinkChanged=function()
{
    if(dynOut.isLinked())
    {
        op.log('dyn out link');
        setTimeout(function()
        {
            var otherPort=dynOut.links[0].getOtherPort(dynOut);
            dynOut.removeLinks();
            var newName="out"+data.ports.length+" "+otherPort.parent.name+" "+otherPort.name;

            data.portsOut.push({"name":newName,"type":otherPort.type});
            
            setupPorts();

            gui.scene().link(
                otherPort.parent,
                otherPort.getName(),
                op,
                newName
                );

            dataLoaded=true;
            saveData();
            
        },100);
    }
    else
    {
        op.log('dynOut unlinked...');
    }
};

function getSubPatchOutputOp()
{
    var patchOutputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchOutput');

    if(!patchOutputOP)
    {
        op.patch.addOp('Ops.Ui.PatchOutput',{'subPatch':op.patchId.get()} );
        patchOutputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchOutput');

        if(!patchOutputOP) console.warn('no patchinput2!');
    }
    op.log('patchOutputOP',patchOutputOP);
    return patchOutputOP;
    
}

function getSubPatchInputOp()
{
    var patchInputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchInput');

    if(!patchInputOP)
    {
        op.patch.addOp('Ops.Ui.PatchInput',{'subPatch':op.patchId.get()} );
        patchInputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchInput');

        if(!patchInputOP) console.warn('no patchinput2!');
    }

    return patchInputOP;
}


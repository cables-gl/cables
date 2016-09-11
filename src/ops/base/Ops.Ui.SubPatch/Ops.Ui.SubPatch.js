op.name="SubPatch";

op.dyn=op.addInPort(new Port(op,"create port",OP_PORT_TYPE_DYNAMIC));
op.dynOut=op.addOutPort(new Port(op,"create port out",OP_PORT_TYPE_DYNAMIC));

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
            var newPortOut=op.addOutPort(new Port(op,portsOut[i].name,portsOut[i].type));
            var patchOutputOp=getSubPatchOutputOp();
            var newPortOutPatch=patchOutputOp.addInPort(new Port(patchOutputOp,portsOut[i].name,portsOut[i].type));

            addPortListener(newPortOutPatch,newPort);
        }
        dataLoaded=true;
    }
}




op.dyn.onLinkChanged=function()
{
    if(op.dyn.isLinked())
    {
        op.log('op.dyn link');
        setTimeout(function()
        {
            if(op.dyn.links[0])
            {
                var otherPort=op.dyn.links[0].getOtherPort(op.dyn);
                op.dyn.removeLinks();
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

            }

        },100);
    }
    else
    {
        op.log('dyn unlinked...');
    }
};

op.dynOut.onLinkChanged=function()
{
    if(op.dynOut.isLinked())
    {
        op.log('dyn out link');
        setTimeout(function()
        {
            var otherPort=op.dynOut.links[0].getOtherPort(op.dynOut);
            op.dynOut.removeLinks();
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

op.addSubLink=function(p,p2)
{
    
    
    setTimeout(function()
    {
var num=data.ports.length;
        if(p.direction==PORT_DIR_IN)
        {
            gui.scene().link(
                p.parent,
                p.getName(),
                getSubPatchInputOp(),
                "in"+(num-1)+" "+p2.parent.name+" "+p2.name
                );
        }
        else
        {
            op.log('OUTUTUTUTUTUT');
            gui.scene().link(
                p.parent,
                p.getName(),
                getSubPatchOutputOp(),
                "out"+(num)+" "+p2.parent.name+" "+p2.name
                );
            
        }
        

// console.log('YO',p.direction);

        
    },100);

    
}







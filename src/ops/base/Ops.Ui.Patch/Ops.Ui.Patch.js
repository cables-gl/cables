
if(!Ops.Ui.Patch.maxPatchId)Ops.Ui.Patch.maxPatchId=0;

op.name='Patch';
op.patchId=op.addInPort(new Port(op,"patchId",OP_PORT_TYPE_VALUE,{ display:'readonly' }));


var getNewDynamicPort=function(name)
{

    for(var i in op.portsIn)
    {
        if(op.portsIn[i].type==OP_PORT_TYPE_DYNAMIC)
        {
            op.portsIn[i].name=name;
            return op.portsIn[i];
        }
    }

    var p=op.addInPort(new Port(op,name,OP_PORT_TYPE_DYNAMIC));
    p.shouldLink=op.shouldLink;
    return p;
};

var hasPort=function(name)
{
    for(var ipi in op.portsIn)
        if(op.portsIn[ipi].getName()==name)
            return op.portsIn[ipi];

    return null;
};

op.getPort=function(name)
{
    for(var ipi in op.portsIn)
        if(op.portsIn[ipi].getName()==name)
            return op.portsIn[ipi];

    for(var ipo in op.portsOut)
        if(op.portsOut[ipo].getName()==name)
            return op.portsOut[ipo];

    var p=getNewDynamicPort(name);

    var realName=name;
    if(name.startsWith('in_'))
    {
        realName=name.substr(3);
        createPatchInputPort(p,realName);
    }

    return p;
};

var getSubPatchInputOp=function()
{
    var patchInputOP=op.patch.getSubPatchOp(op.patchId.val,'Ops.Ui.PatchInput');
    var patchOutputOP=op.patch.getSubPatchOp(op.patchId.val,'Ops.Ui.PatchOutput');

    if(!patchOutputOP)
    {
        op.patch.addOp('Ops.Ui.PatchOutput',{'subPatch':op.patchId.val} );

        patchOutputOP=op.patch.getSubPatchOp(op.patchId.val,'Ops.Ui.PatchOutput');

        if(!patchOutputOP) console.warn('no patchinput2!');
    }

    if(!patchInputOP)
    {
        op.patch.addOp('Ops.Ui.PatchInput',{'subPatch':op.patchId.val} );

        patchInputOP=op.patch.getSubPatchOp(op.patchId.val,'Ops.Ui.PatchInput');

        if(!patchInputOP) console.warn('no patchinput2!');
    }

    return patchInputOP;
};

op.routeLink=function(link)
{
    var mainName=link.portOut.getName();
    var newDyn=getNewDynamicPort( 'in_'+mainName );

    var otherOpOut=link.portOut.parent;
    var otherPortOut=link.portOut;

    var otherOpIn=link.portIn.parent;
    var otherPortIn=link.portIn;

    newDyn.type=otherPortOut.type;

    link.remove();

    if(!CABLES.Link.canLink(otherPortOut,newDyn))
    {
        console.log('cannot route link');
        return;
    }

    var l1=gui.scene().link(
        otherOpOut,
        otherPortOut.getName(),
        op,
        newDyn.name
        );

    var pOutPort=createPatchInputPort(newDyn,mainName);

    var l2=gui.scene().link(
        otherOpIn,
        otherPortIn.getName(),
        pOutPort.parent,
        pOutPort.name
        );

    // if(!op.hasDynamicPort())getNewDynamicPort('dyn');

};

function createPatchInputPort(dynPort,name)
{
    var patchInputOP=getSubPatchInputOp();

    if(op.uiAttribs && op.uiAttribs.translate)
    {
        patchInputOP.uiAttribs.translate={x:op.uiAttribs.translate.x,y:op.uiAttribs.translate.y-100};        
    }


    var pOut=patchInputOP.getPortByName('out_'+name);

    if(pOut)
    {
        pOut.type=dynPort.type;
    }
    else
    {
        pOut = patchInputOP.addOutPort(new Port(op,"out_"+name,dynPort.type));
    }

    if(dynPort.type==OP_PORT_TYPE_FUNCTION)
    {
        dynPort.onTriggered=function()
        {
            pOut.trigger();
        };
        dynPort.onTriggered();
    }
    else
    {
        dynPort.onValueChanged=function()
        {
            pOut.val=dynPort.val;
        };
        dynPort.onValueChanged();
    }

    return pOut;
}

op.shouldLink=function(p1,p2)
{
    if(p1.type!=OP_PORT_TYPE_DYNAMIC && p2.type!=OP_PORT_TYPE_DYNAMIC)
    {
        console.log('shouldlink?');
        console.log(p1.name);
        console.log(p2.name);
        return true;
    }

    var dynPort=p2;
    var otherPort=p1;

    if(p1.type==OP_PORT_TYPE_DYNAMIC)
    {
        dynPort=p1;
        otherPort=p2;
    }

    dynPort.type=otherPort.type;
    dynPort.name='in_'+otherPort.getName();

    createPatchInputPort(dynPort,otherPort.getName());

    if(CABLES.UI)gui.patch().updateSubPatches();
    if(!op.hasDynamicPort())getNewDynamicPort('dyn');

    return true;
}

op.patchId.onValueChanged=function()
{
    Ops.Ui.Patch.maxPatchId=Math.max(Ops.Ui.Patch.maxPatchId,op.patchId.val);
};

op.patchId.val=Ops.Ui.Patch.maxPatchId+1;

op.onCreate=function()
{
    if(!op.hasDynamicPort())getNewDynamicPort('dyn');
    getSubPatchInputOp();

    if (CABLES.UI) gui.patch().updateSubPatches();
};

op.onDelete=function()
{
    for (var i = op.patch.ops.length-1; i >=0 ; i--)
    {
        if(op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch==op.patchId.val)
        {
            console.log(op.patch.ops[i].objName);

            op.patch.deleteOp(op.patch.ops[i].id);

        }
    }

};

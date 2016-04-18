
this.name='PatchOutput';


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

function createPatchOutputPort(dynPort,name)
{
    // var patchInputOP=getSubPatchInputOp();

    // if(op.uiAttribs && op.uiAttribs.translate)
    // {
    //     patchInputOP.uiAttribs.translate={x:op.uiAttribs.translate.x,y:op.uiAttribs.translate.y-100};        
    // }


    // var pOut=patchInputOP.getPortByName('out_'+name);

    // if(pOut)
    // {
    //     pOut.type=dynPort.type;
    // }
    // else
    // {
    //     pOut = patchInputOP.addOutPort(new Port(op,"out_"+name,dynPort.type));
    // }

    // if(dynPort.type==OP_PORT_TYPE_FUNCTION)
    // {
    //     dynPort.onTriggered=function()
    //     {
    //         pOut.trigger();
    //     };
    //     dynPort.onTriggered();
    // }
    // else
    // {
    //     dynPort.onValueChanged=function()
    //     {
    //         pOut.val=dynPort.val;
    //     };
    //     dynPort.onValueChanged();
    // }

    // return pOut;
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

    createPatchOutputPort(dynPort,otherPort.getName());

    if(CABLES.UI)gui.patch().updateSubPatches();
    if(!op.hasDynamicPort())getNewDynamicPort('dyn');

    return true;
};

op.onCreate=function()
{
    if(!op.hasDynamicPort())getNewDynamicPort('dyn');
    // getSubPatchInputOp();

    // if (CABLES.UI) gui.patch().updateSubPatches();
};

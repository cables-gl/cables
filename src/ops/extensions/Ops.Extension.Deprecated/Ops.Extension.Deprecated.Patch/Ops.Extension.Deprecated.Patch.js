// if(!Ops.Ui.Patch.maxPatchId)Ops.Ui.Patch.maxPatchId=0;

op.name = "Patch";
op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_VALUE, { "display": "readonly" }));

let getNewDynamicPort = function (name)
{
    for (let i in op.portsIn)
    {
        if (op.portsIn[i].type == CABLES.OP_PORT_TYPE_DYNAMIC)
        {
            op.portsIn[i].name = name;
            return op.portsIn[i];
        }
    }

    let p = op.addInPort(new CABLES.Port(op, name, CABLES.OP_PORT_TYPE_DYNAMIC));
    p.shouldLink = op.shouldLink;
    return p;
};

let hasPort = function (name)
{
    for (let ipi in op.portsIn)
        if (op.portsIn[ipi].getName() == name)
            return op.portsIn[ipi];

    return null;
};

op.getPort = function (name)
{
    for (let ipi in op.portsIn)
        if (op.portsIn[ipi].getName() == name)
            return op.portsIn[ipi];

    for (let ipo in op.portsOut)
        if (op.portsOut[ipo].getName() == name)
            return op.portsOut[ipo];

    let p = getNewDynamicPort(name);

    let realName = name;
    if (name.startsWith("in_"))
    {
        realName = name.substr(3);
        createPatchInputPort(p, realName);
    }

    return p;
};

let getSubPatchInputOp = function ()
{
    let patchInputOP = op.patch.getFirstSubPatchOpByName(op.patchId.get(), "Ops.Ui.PatchInput");
    let patchOutputOP = op.patch.getFirstSubPatchOpByName(op.patchId.get(), "Ops.Ui.PatchOutput");

    if (!patchOutputOP)
    {
        op.patch.addOp("Ops.Ui.PatchOutput", { "subPatch": op.patchId.get() });

        patchOutputOP = op.patch.getFirstSubPatchOpByName(op.patchId.get(), "Ops.Ui.PatchOutput");

        if (!patchOutputOP) console.warn("no patchinput2!");
    }

    if (!patchInputOP)
    {
        op.patch.addOp("Ops.Ui.PatchInput", { "subPatch": op.patchId.get() });

        patchInputOP = op.patch.getFirstSubPatchOpByName(op.patchId.get(), "Ops.Ui.PatchInput");

        if (!patchInputOP) console.warn("no patchinput2!");
    }

    if (op.uiAttribs && op.uiAttribs.translate)
    {
        patchInputOP.uiAttribs.translate = { "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y - 100 };
    }

    return patchInputOP;
};

op.routeLink = function (link)
{
    let mainName = link.portOut.getName();
    let newDyn = getNewDynamicPort("in_" + mainName);

    let otherOpOut = link.portOut.parent;
    let otherPortOut = link.portOut;

    let otherOpIn = link.portIn.parent;
    let otherPortIn = link.portIn;

    newDyn.type = otherPortOut.type;

    link.remove();

    if (!CABLES.Link.canLink(otherPortOut, newDyn))
    {
        console.log("cannot route link");
        return;
    }

    let l1 = gui.scene().link(
        otherOpOut,
        otherPortOut.getName(),
        op,
        newDyn.name
    );

    let pOutPort = createPatchInputPort(newDyn, mainName);

    let l2 = gui.scene().link(
        otherOpIn,
        otherPortIn.getName(),
        pOutPort.parent,
        pOutPort.name
    );

    // if(!op.hasDynamicPort())getNewDynamicPort('dyn');
};

function createPatchInputPort(dynPort, name)
{
    let patchInputOP = getSubPatchInputOp();

    let pOut = patchInputOP.getPortByName("out_" + name);

    if (pOut)
    {
        pOut.type = dynPort.type;
    }
    else
    {
        pOut = patchInputOP.addOutPort(new CABLES.Port(op, "out_" + name, dynPort.type));
    }

    if (dynPort.type == CABLES.OP_PORT_TYPE_FUNCTION)
    {
        dynPort.onTriggered = function ()
        {
            pOut.trigger();
        };
        if (dynPort.onTriggered)dynPort.onTriggered();
    }
    else
    {
        dynPort.onChange = function ()
        {
            pOut.set(dynPort.get());
        };
        if (dynPort.onValueChanged)dynPort.onValueChanged();
    }

    return pOut;
}

op.shouldLink = function (p1, p2)
{
    if (p1.type != CABLES.OP_PORT_TYPE_DYNAMIC && p2.type != CABLES.OP_PORT_TYPE_DYNAMIC)
    {
        console.log("shouldlink?");
        console.log(p1.name);
        console.log(p2.name);
        return true;
    }

    let dynPort = p2;
    let otherPort = p1;

    if (p1.type == CABLES.OP_PORT_TYPE_DYNAMIC)
    {
        dynPort = p1;
        otherPort = p2;
    }

    dynPort.type = otherPort.type;
    dynPort.name = "in_" + otherPort.getName();

    createPatchInputPort(dynPort, otherPort.getName());

    // if(CABLES.UI)gui.patch().updateSubPatches();
    if (!op.hasDynamicPort())getNewDynamicPort("dyn");

    return true;
};

op.patchId.onChange = function ()
{
    // Ops.Ui.Patch.maxPatchId=Math.max(Ops.Ui.Patch.maxPatchId,op.patchId.get());
};

op.patchId.set(CABLES.generateUUID());

op.onCreate = function ()
{
    if (!op.hasDynamicPort())getNewDynamicPort("dyn");
    getSubPatchInputOp();

    // if (CABLES.UI) gui.patch().updateSubPatches();
};

op.onDelete = function ()
{
    for (let i = op.patch.ops.length - 1; i >= 0; i--)
    {
        if (op.patch.ops[i] && op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch == op.patchId.get())
        {
            // console.log(op.patch.ops[i].objName);
            op.patch.deleteOp(op.patch.ops[i].id);
        }
    }
};

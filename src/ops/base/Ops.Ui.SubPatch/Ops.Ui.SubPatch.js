op.dyn = op.addInPort(new CABLES.Port(op, "create port", CABLES.OP_PORT_TYPE_DYNAMIC));
op.dynOut = op.addOutPort(new CABLES.Port(op, "create port out", CABLES.OP_PORT_TYPE_DYNAMIC));

const dataStr = op.addInPort(new CABLES.Port(op, "dataStr", CABLES.OP_PORT_TYPE_VALUE, { "display": "readonly" }));
op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_VALUE, { "display": "readonly" }));

dataStr.setUiAttribs({ "hideParam": true });
op.patchId.setUiAttribs({ "hideParam": true });

let data = { "ports": [], "portsOut": [] };

// Ops.Ui.Patch.maxPatchId=CABLES.generateUUID();

op.patchId.onChange = function ()
{
    const oldPatchOps = op.patch.getSubPatchOps(oldPatchId);

    if (oldPatchOps.length == 2)
    {
        for (let i = 0; i < oldPatchOps.length; i++)
        {
            op.patch.deleteOp(oldPatchOps[i].id);
        }
    }
    else
    {
    }
};

var oldPatchId = CABLES.generateUUID();
op.patchId.set(oldPatchId);

op.onLoaded = function ()
{
    // op.patchId.set(CABLES.generateUUID());
};

op.onLoadedValueSet = function ()
{
    data = JSON.parse(dataStr.get());
    if (!data)
    {
        data = { "ports": [], "portsOut": [] };
    }
    setupPorts();
};

function loadData()
{
}

getSubPatchInputOp();
getSubPatchOutputOp();

let dataLoaded = false;
dataStr.onChange = function ()
{
    if (dataLoaded) return;

    if (!dataStr.get()) return;
    try
    {
        loadData();
    }
    catch (e)
    {
        op.error("cannot load subpatch data...");
        op.error(e);
    }
};

function saveData()
{
    dataStr.set(JSON.stringify(data));
}

function addPortListener(newPort, newPortInPatch)
{
    newPort.addEventListener("onUiAttrChange", function (attribs)
    {
        if (attribs.title)
        {
            let i = 0;
            for (i = 0; i < data.portsOut.length; i++)
                if (data.portsOut[i].name == newPort.name)
                    data.portsOut[i].title = attribs.title;

            for (i = 0; i < data.ports.length; i++)
                if (data.ports[i].name == newPort.name)
                    data.ports[i].title = attribs.title;

            saveData();
        }
    });

    if (newPort.direction == CABLES.PORT_DIR_IN)
    {
        if (newPort.type == CABLES.OP_PORT_TYPE_FUNCTION)
        {
            newPort.onTriggered = function ()
            {
                if (newPortInPatch.isLinked())
                    newPortInPatch.trigger();
            };
        }
        else
        {
            newPort.onChange = function ()
            {
                newPortInPatch.set(newPort.get());
            };
        }
    }
}

function setupPorts()
{
    if (!op.patchId.get()) return;
    const ports = data.ports || [];
    const portsOut = data.portsOut || [];
    let i = 0;

    for (i = 0; i < ports.length; i++)
    {
        if (!op.getPortByName(ports[i].name))
        {
            const newPort = op.addInPort(new CABLES.Port(op, ports[i].name, ports[i].type));

            const patchInputOp = getSubPatchInputOp();
            const newPortInPatch = patchInputOp.addOutPort(new CABLES.Port(patchInputOp, ports[i].name, ports[i].type));

            newPort.ignoreValueSerialize = true;
            newPort.setUiAttribs({ "editableTitle": true });
            if (ports[i].title)
            {
                newPort.setUiAttribs({ "title": ports[i].title });
                newPortInPatch.setUiAttribs({ "title": ports[i].title });
            }
            if (ports[i].objType)
            {
                newPort.setUiAttribs({ "objType": ports[i].objType });
                newPortInPatch.setUiAttribs({ "objType": ports[i].objType });
            }
            addPortListener(newPort, newPortInPatch);
        }
    }

    for (i = 0; i < portsOut.length; i++)
    {
        if (!op.getPortByName(portsOut[i].name))
        {
            const newPortOut = op.addOutPort(new CABLES.Port(op, portsOut[i].name, portsOut[i].type));
            const patchOutputOp = getSubPatchOutputOp();
            const newPortOutPatch = patchOutputOp.addInPort(new CABLES.Port(patchOutputOp, portsOut[i].name, portsOut[i].type));

            newPortOut.ignoreValueSerialize = true;
            newPortOut.setUiAttribs({ "editableTitle": true });

            if (portsOut[i].title)
            {
                newPortOut.setUiAttribs({ "title": portsOut[i].title });
                newPortOutPatch.setUiAttribs({ "title": portsOut[i].title });
            }
            if (portsOut[i].objType)
            {
                newPortOut.setUiAttribs({ "objType": portsOut[i].objType });
                newPortOutPatch.setUiAttribs({ "objType": portsOut[i].objType });
            }

            // addPortListener(newPortOut,newPortOutPatch);
            addPortListener(newPortOutPatch, newPortOut);
        }
    }

    dataLoaded = true;
}

op.dyn.onLinkChanged = function ()
{
    if (op.dyn.isLinked())
    {
        const otherPort = op.dyn.links[0].getOtherPort(op.dyn);
        op.dyn.removeLinks();
        otherPort.removeLinkTo(op.dyn);

        op.log("dyn link changed!!!");

        const newName = "in" + data.ports.length + " " + otherPort.parent.name + " " + otherPort.name;

        const o = { "name": newName, "type": otherPort.type };
        if (otherPort.uiAttribs.objType)o.objType = otherPort.uiAttribs.objType;
        data.ports.push(o);

        setupPorts();

        const l = gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
        );

        dataLoaded = true;
        saveData();
    }
    else
    {
        setTimeout(function ()
        {
            op.dyn.removeLinks();
            gui.patch().removeDeadLinks();
        }, 100);
    }
};

op.dynOut.onLinkChanged = function ()
{
    if (op.dynOut.isLinked())
    {
        const otherPort = op.dynOut.links[0].getOtherPort(op.dynOut);
        op.dynOut.removeLinks();
        otherPort.removeLinkTo(op.dynOut);
        const newName = "out" + data.ports.length + " " + otherPort.parent.name + " " + otherPort.name;

        const o = { "name": newName, "type": otherPort.type };
        if (otherPort.uiAttribs.objType)o.objType = otherPort.uiAttribs.objType;

        data.portsOut.push(o);

        setupPorts();

        gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
        );

        dataLoaded = true;
        saveData();
    }
    else
    {
        setTimeout(function ()
        {
            op.dynOut.removeLinks();
            gui.patch().removeDeadLinks();
        }, 100);

        op.log("dynOut unlinked...");
    }
    gui.patch().removeDeadLinks();
};

function getSubPatchOutputOp()
{
    let patchOutputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchOutput");

    if (!patchOutputOP)
    {
        op.patch.addOp("Ops.Ui.PatchOutput", { "subPatch": op.patchId.get() });
        patchOutputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchOutput");

        if (!patchOutputOP) op.warn("no patchinput2!");
    }
    return patchOutputOP;
}

function getSubPatchInputOp()
{
    let patchInputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchInput");

    if (!patchInputOP)
    {
        op.patch.addOp("Ops.Ui.PatchInput", { "subPatch": op.patchId.get() });
        patchInputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchInput");
        if (!patchInputOP) op.warn("no patchinput2!");
    }

    return patchInputOP;
}

op.addSubLink = function (p, p2)
{
    const num = data.ports.length;
    const sublPortname = "in" + (num - 1) + " " + p2.parent.name + " " + p2.name;

    if (p.direction == CABLES.PORT_DIR_IN)
    {
        gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchInputOp(),
            sublPortname
        );
    }
    else
    {
        gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchOutputOp(),
            "out" + (num) + " " + p2.parent.name + " " + p2.name
        );
    }

    const bounds = gui.patchView.getSubPatchBounds(op.patchId.get());
    op.log("subpatchbounds", bounds);
    getSubPatchInputOp().uiAttr(
        {
            "translate":
            {
                "x": bounds.minx,
                "y": bounds.miny - 100
            }
        });

    getSubPatchOutputOp().uiAttr(
        {
            "translate":
            {
                "x": bounds.minx,
                "y": bounds.maxy + 100
            }
        });
    saveData();
    return sublPortname;
};

op.onDelete = function ()
{
    for (let i = op.patch.ops.length - 1; i >= 0; i--)
    {
        if (op.patch.ops[i] && op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch == op.patchId.get())
        {
            op.patch.deleteOp(op.patch.ops[i].id);
        }
    }
};

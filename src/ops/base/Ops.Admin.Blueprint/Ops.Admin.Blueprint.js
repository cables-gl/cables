const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const activeIn = op.inBool("active", false);
const loadingOut = op.outBool("loading");

patchIdIn.setUiAttribs({ "hidePort": true });
subPatchIdIn.setUiAttribs({ "hidePort": true });

activeIn.onChange = () =>
{
    if (activeIn.get())
    {
        update();
    }
    else
    {
        removeImportedOps();
    }
};

op.onLoadedValueSet = () =>
{
    if (activeIn.get())
    {
        update();
    }
    else
    {
        removeImportedOps();
    }
};

op.onDelete = removeImportedOps;

let blueprintId = op.id;

function update()
{
    loadingOut.set(true);
    const patch = op.patch;
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();
    blueprintId = patchId + "-" + subPatchId;
    if (patch.isEditorMode())
    {
        const options = {
            "blueprintId": blueprintId,
            "patchId": patchId,
            "subPatchId": subPatchId
        };
        CABLES.sandbox.getBlueprintOps(options, (err, blueprintData) =>
        {
            op.setUiError("fetchOps", null);
            if (!err)
            {
                removeImportedOps();
                blueprintData.settings = op.patch.settings;
                blueprintData.ops = blueprintData.msg;
                deSerializeBlueprint(blueprintData, subPatchId, true);
            }
            else
            {
                op.setUiError("fetchOps", err);
            }
            loadingOut.set(false);
        });
    }
    else
    {
        const blueprintUrl = "js/" + blueprintId + ".json";
        CABLES.ajax(
            blueprintUrl,
            function (err, data)
            {
                if (!err)
                {
                    const blueprint = JSON.parse(data);
                    deSerializeBlueprint(blueprint, subPatchId, false);
                }
                else
                {
                    op.error("failed to load blueprint from", blueprintUrl, err);
                }
                loadingOut.set(false);
            }
        );
    }
}

function deSerializeBlueprint(data, subPatchId, editorMode)
{
    if (Array.isArray(data.ops) && data.ops.length > 0)
    {
        op.patch.config.onPatchLoaded = function (patch)
        {
            op.patch.onPatchLoaded = null;
            const parentSubPatch = patch.ops.find((op) =>
                op.uiAttribs &&
                op.uiAttribs.blueprint &&
                op.uiAttribs.blueprint.isParentSubPatch &&
                op.uiAttribs.blueprint.id == blueprintId
            );
            if (parentSubPatch)
            {
                op.setUiAttrib({ "extendTitle": parentSubPatch.uiAttribs.title });
                setupPorts(parentSubPatch);
            }
        };

        if (editorMode)
        {
            gui.serverOps.loadProjectLibs(data, () =>
            {
                op.patch.deSerialize(data, false);
                gui.patchView.setCurrentSubPatch(subPatchId);
                gui.patchView.setCurrentSubPatch(0);
            });
        }
        else
        {
            op.patch.deSerialize(data, false);
        }
    }
}

function removeImportedOps()
{
    const opsToDelete = [];
    op.patch.ops.forEach((subOp) =>
    {
        if (subOp.uiAttribs.blueprint && subOp.uiAttribs.blueprint.id === blueprintId)
        {
            opsToDelete.push(subOp.id);
        }
    });
    opsToDelete.forEach((toDelete) =>
    {
        if (op.patch.getOpById(toDelete))
        {
            op.patch.deleteOp(toDelete);
        }
    });
}

const removeInPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsIn.length; ipi++)
    {
        if (op.portsIn[ipi] == port)
        {
            op.portsIn.splice(ipi, 1);
            return;
        }
    }
};

const removeOutPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsOut.length; ipi++)
    {
        if (op.portsOut[ipi] == port)
        {
            op.portsOut.splice(ipi, 1);
            return;
        }
    }
};

function setupPorts(parentSubPatch)
{
    const dataPort = parentSubPatch.portsIn.find((port) => port.name === "dataStr");
    if (!dataPort) return;
    if (!dataPort.get()) return;

    const oldLinksIn = {};
    const oldValuesIn = {};
    const oldLinksOut = {};

    const removeInPorts = [];
    const removeOutPorts = [];

    const protectedPorts = [patchIdIn.id, subPatchIdIn.id, activeIn.id, loadingOut.id];

    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            oldLinksIn[port.name] = [];
            oldValuesIn[port.name] = port.get();
            port.links.forEach((link) =>
            {
                const linkInfo = {
                    "op": link.portOut.parent,
                    "portName": link.portOut.name
                };
                oldLinksIn[port.name].push(linkInfo);
            });
            removeInPorts.push(port);
        }
    });
    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            oldLinksOut[port.name] = [];
            port.links.forEach((link) =>
            {
                const linkInfo = {
                    "op": link.portIn.parent,
                    "portName": link.portIn.name
                };
                oldLinksOut[port.name].push(linkInfo);
            });
            removeOutPorts.push(port);
        }
    });
    /*
    removeInPorts.forEach((port) =>
    {
        removeInPort(port);
    });

    removeOutPorts.forEach((port) =>
    {
        removeOutPort(port);
    });
    if (removeOutPorts.length > 0 || removeInPorts.length > 0)
    {
        op.fireEvent("onUiAttribsChange", {});
        op.fireEvent("onPortRemoved", {});
    }
    */

    const data = JSON.parse(dataPort.get());
    const ports = data.ports || [];
    const portsOut = data.portsOut || [];
    let i = 0;

    for (i = 0; i < ports.length; i++)
    {
        if (!op.getPortByName(ports[i].name))
        {
            const subPatchPort = parentSubPatch.portsIn.find((port) => port.name == ports[i].name);
            const newPort = op.addInPort(new CABLES.Port(op, ports[i].name, ports[i].type));
            /*
            if (oldValuesIn[ports[i].name])
            {
                newPort.set(oldValuesIn[ports[i].name]);
            }
            if (oldLinksIn[ports[i].name])
            {
                oldLinksIn[ports[i].name].forEach((link) =>
                {
                    op.patch.link(op, ports[i].name, link.op, link.portName);
                });
            }
            */
            if (subPatchPort)
            {
                switch (ports[i].type)
                {
                case CABLES.OP_PORT_TYPE_FUNCTION:
                    newPort.onTriggered = () =>
                    {
                        // subPatchPort.onTriggered = undefined;
                        // subPatchPort.links = [
                        //    { "activity": function () {} }
                        // ];
                        subPatchPort.trigger();
                    };
                    break;
                default:
                    newPort.onChange = () =>
                    {
                        subPatchPort.set(newPort.get());
                    };
                }
            }

            newPort.ignoreValueSerialize = true;
            newPort.setUiAttribs({ "editableTitle": true });
            if (ports[i].title)
            {
                newPort.setUiAttribs({ "title": ports[i].title });
            }
        }
    }

    for (i = 0; i < portsOut.length; i++)
    {
        if (!op.getPortByName(portsOut[i].name))
        {
            const subPatchPort = parentSubPatch.portsOut.find((port) => port.name == portsOut[i].name);
            const newPortOut = op.addOutPort(new CABLES.Port(op, portsOut[i].name, portsOut[i].type));
            /*
            if (oldLinksOut[portsOut[i].name])
            {
                oldLinksOut[portsOut[i].name].forEach((link) =>
                {
                    op.patch.link(op, portsOut[i].name, link.op, link.portName);
                });
            }
            */
            if (subPatchPort)
            {
                switch (subPatchPort.type)
                {
                case CABLES.OP_PORT_TYPE_FUNCTION:
                    subPatchPort.onTriggered = () =>
                    {
                        newPortOut.trigger();
                    };
                    break;
                default:
                    subPatchPort.onChange = () =>
                    {
                        newPortOut.set(subPatchPort.get());
                    };
                }
            }
            newPortOut.ignoreValueSerialize = true;
            newPortOut.setUiAttribs({ "editableTitle": true });

            if (portsOut[i].title)
            {
                newPortOut.setUiAttribs({ "title": portsOut[i].title });
            }
        }
    }
}

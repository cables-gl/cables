const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const activeIn = op.inBool("active", false);
const portsData = op.inString("portsData", "{}");

const loadingOut = op.outBool("loading", false);

patchIdIn.setUiAttribs({ "hidePort": true });
subPatchIdIn.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hideParam": true });

const protectedPorts = [patchIdIn.id, subPatchIdIn.id, activeIn.id, portsData.id, loadingOut.id];

const restorePorts = () =>
{
    const oldPorts = getOldPorts();
    const portInKeys = Object.keys(oldPorts.portsIn);
    for (let i = 0; i < portInKeys.length; i++)
    {
        const oldPortIn = oldPorts.portsIn[portInKeys[i]];
        const newPort = op.addInPort(new CABLES.Port(op, oldPortIn.name, oldPortIn.type));
        if (Array.isArray(oldPortIn.links))
        {
            oldPortIn.links.forEach((link) =>
            {
                const parent = op.patch.getOpById(link.objOut);
                if (parent)
                {
                    op.patch.link(parent, link.portOut, op, newPort.name);
                }
            });
        }
        newPort.onLinkChanged = savePortData;

        if (oldPortIn.title)
        {
            newPort.setUiAttribs({ "title": oldPortIn.title });
        }
    }

    const portOutKeys = Object.keys(oldPorts.portsOut);
    for (let i = 0; i < portOutKeys.length; i++)
    {
        const oldPortOut = oldPorts.portsOut[portOutKeys[i]];
        const newPort = op.addOutPort(new CABLES.Port(op, oldPortOut.name, oldPortOut.type));
        if (Array.isArray(oldPortOut.links))
        {
            oldPortOut.links.forEach((link) =>
            {
                const parent = op.patch.getOpById(link.objIn);
                if (parent)
                {
                    op.patch.link(op, newPort.name, parent, link.portIn);
                }
            });
            newPort.onLinkChanged = savePortData;

            if (oldPortOut.title)
            {
                newPort.setUiAttribs({ "title": oldPortOut.title });
            }
        }
    }
};

activeIn.onChange = () =>
{
    if (!loadingOut.get())
    {
        if (activeIn.get())
        {
            op.setUiError("inactive", null);
            update();
        }
        else
        {
            op.setUiError("inactive", "blueprint is inactive", 0);
            removeImportedOps();
        }
    }
};

op.onLoaded = () =>
{
    cleanupPorts();
    restorePorts();
    if (!loadingOut.get())
    {
        if (activeIn.get())
        {
            op.setUiError("inactive", null);
            update();
        }
        else
        {
            op.setUiError("inactive", "blueprint is inactive", 0);
            removeImportedOps();
        }
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
                if (err.code === 403)
                {
                    op.setUiError("fetchOps", "you do not have permission to use this blueprint");
                }
                else
                {
                    op.setUiError("fetchOps", "error fetching blueprint, code: " + err.code);
                }
            }
            loadingOut.set(false);
        });
    }
    else if (document.location.href.indexOf("cables.gl") > 0)
    {
        // use this to workaround /viewer/ and /p/ not being "isEditorMode" but also not having exported assets
        let blueprintUrl = "http://cables.gl/api/blueprints/" + blueprintId + "/" + patchId + "/" + subPatchId;
        if (document.location.hostname.indexOf("devsandbox") > 0)
        {
            blueprintUrl = "http://dev.cables.gl/api/blueprints/" + blueprintId + "/" + patchId + "/" + subPatchId;
        }
        CABLES.ajax(
            blueprintUrl,
            function (err, data)
            {
                if (!err)
                {
                    const blueprintData = JSON.parse(data);
                    blueprintData.settings = op.patch.settings;
                    blueprintData.ops = blueprintData.msg;
                    deSerializeBlueprint(blueprintData, subPatchId, false);
                }
                else
                {
                    op.error("failed to load blueprint from", blueprintUrl, err);
                }
                loadingOut.set(false);
            }
        );
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
                    const blueprintData = JSON.parse(data);
                    blueprintData.settings = op.patch.settings;
                    blueprintData.ops = blueprintData.msg;
                    deSerializeBlueprint(blueprintData, subPatchId, false);
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
            const parentSubPatch = patch.ops.find(op =>
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
                const originalSubPatchId = gui.patchView.getCurrentSubPatch();
                // gui.patchView.setCurrentSubPatch(subPatchId);
                gui.patchView.setCurrentSubPatch(originalSubPatchId);
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

const getOldPorts = () =>
{
    const oldPorts = JSON.parse(portsData.get());
    let oldPortsOut = {};
    if (oldPorts.portsOut)
    {
        oldPortsOut = oldPorts.portsOut;
    }
    let oldPortsIn = {};
    if (oldPorts.portsIn)
    {
        oldPortsIn = oldPorts.portsIn;
    }
    return { "portsIn": oldPortsIn, "portsOut": oldPortsOut };
};

const cleanupPorts = () =>
{
    const removeInPorts = [];
    const removeOutPorts = [];

    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            removeInPorts.push(port);
        }
    });
    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            removeOutPorts.push(port);
        }
    });

    removeInPorts.forEach((port) =>
    {
        removeInPort(port);
        op.fireEvent("onPortRemoved", {});
    });

    removeOutPorts.forEach((port) =>
    {
        removeOutPort(port);
        op.fireEvent("onPortRemoved", {});
    });

    if (removeOutPorts.length > 0 || removeInPorts.length > 0)
    {
        op.fireEvent("onUiAttribsChange", {});
    }
};

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
    const subPatchDataPort = parentSubPatch.portsIn.find(port => port.name === "dataStr");
    if (!subPatchDataPort) return;
    if (!subPatchDataPort.get()) return;

    const oldPorts = getOldPorts();
    cleanupPorts();

    const subPatchData = JSON.parse(subPatchDataPort.get());
    const subPatchPortsIn = subPatchData.ports || [];
    const subPatchPortsOut = subPatchData.portsOut || [];
    let i = 0;

    for (i = 0; i < subPatchPortsIn.length; i++)
    {
        if (!op.getPortByName(subPatchPortsIn[i].name))
        {
            const subPatchPort = parentSubPatch.portsIn.find(port => port.name == subPatchPortsIn[i].name);
            const newPort = op.addInPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));
            if (oldPorts.portsIn.hasOwnProperty(newPort.name) && Array.isArray(oldPorts.portsIn[newPort.name].links))
            {
                oldPorts.portsIn[newPort.name].links.forEach((link) =>
                {
                    const parent = op.patch.getOpById(link.objOut);
                    if (parent)
                    {
                        op.patch.link(parent, link.portOut, op, newPort.name);
                    }
                });
            }
            newPort.onLinkChanged = savePortData;

            if (subPatchPort)
            {
                switch (subPatchPort.type)
                {
                case CABLES.OP_PORT_TYPE_FUNCTION:
                    newPort.onTriggered = () =>
                    {
                        subPatchPort.onTriggered();
                    };
                    break;
                default:
                    newPort.onChange = () =>
                    {
                        subPatchPort.set(newPort.get());
                    };
                }
            }

            if (subPatchPort.title)
            {
                newPort.setUiAttribs({ "title": subPatchPortsIn[i].title });
            }
        }
    }

    for (i = 0; i < subPatchPortsOut.length; i++)
    {
        if (!op.getPortByName(subPatchPortsOut[i].name))
        {
            const patchOutputOP = op.patch.getSubPatchOp(subPatchIdIn.get(), "Ops.Ui.PatchOutput");
            if (patchOutputOP.portsIn)
            {
                const subPatchPort = patchOutputOP.portsIn.find(port => port.name == subPatchPortsOut[i].name);
                const newPort = op.addOutPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));
                if (oldPorts.portsOut.hasOwnProperty(newPort.name) && Array.isArray(oldPorts.portsOut[newPort.name].links))
                {
                    oldPorts.portsOut[newPort.name].links.forEach((link) =>
                    {
                        const parent = op.patch.getOpById(link.objIn);
                        if (parent)
                        {
                            op.patch.link(op, newPort.name, parent, link.portIn);
                        }
                    });
                }
                newPort.onLinkChanged = savePortData;

                if (subPatchPort)
                {
                    switch (subPatchPort.type)
                    {
                    case CABLES.OP_PORT_TYPE_FUNCTION:
                        subPatchPort.onTriggered = () =>
                        {
                            newPort.trigger();
                        };
                        break;
                    default:
                        subPatchPort.onChange = () =>
                        {
                            newPort.set(subPatchPort.get());
                        };
                    }
                    newPort.set(subPatchPort.get());
                }
                if (subPatchPort.title)
                {
                    newPort.setUiAttribs({ "title": subPatchPortsOut[i].title });
                }
            }
        }
    }
    savePortData();
}

function savePortData()
{
    const newPortsData = { "portsIn": {}, "portsOut": {} };
    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            const portData = {
                "name": port.name,
                "title": port.title,
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                const linkData = {
                    "objOut": link.portOut.parent.id,
                    "portOut": link.portOut.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsIn[port.name] = portData;
        }
    });

    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            const portData = {
                "name": port.name,
                "title": port.title,
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                const linkData = {
                    "objIn": link.portIn.parent.id,
                    "portIn": link.portIn.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsOut[port.name] = portData;
        }
    });
    portsData.set(JSON.stringify(newPortsData));
}

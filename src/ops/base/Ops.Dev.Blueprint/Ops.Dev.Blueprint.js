const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const activeIn = op.inBool("active", false);
const gotoIn = op.inTriggerButton("Open patch");
const portsData = op.inString("portsData", "{}");

const loadingOut = op.outBool("loading", false);
let loadingId = null;
patchIdIn.setUiAttribs({ "hidePort": true });
subPatchIdIn.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hideParam": true });

gotoIn.setUiAttribs({ "greyout": true });
gotoIn.setUiAttribs({ "hidePort": true });

let wasPasted = false;

subPatchIdIn.onChange = () =>
{
    if (!activeIn.get())
    {
        op.setUiError("fetchOps", null);
    }
    if (!loadingOut.get() && activeIn.get() && patchIdIn.get() && subPatchIdIn.get())
    {
        update();
    }
};

if (op.patch.isEditorMode())
{
    gotoIn.onTriggered = function ()
    {
        if (CABLES && CABLES.sandbox && CABLES.sandbox.getCablesUrl())
        {
            window.open(CABLES.sandbox.getCablesUrl() + "/edit/" + patchIdIn.get(), "_blank");
        }
    };

    patchIdIn.onChange = function ()
    {
        if (patchIdIn.get())
        {
            gotoIn.setUiAttribs({ "greyout": false });
            if (!activeIn.get())
            {
                op.setUiError("fetchOps", null);
            }
            if (!loadingOut.get() && activeIn.get() && subPatchIdIn.get())
            {
                update();
            }
        }
        else
        {
            gotoIn.setUiAttribs({ "greyout": true });
        }
    };
}

const protectedPorts = [patchIdIn.id, subPatchIdIn.id, activeIn.id, portsData.id, loadingOut.id, gotoIn.id];

if (!activeIn.get())
{
    op.setUiError("inactive", "blueprint is inactive", 0);
}

const restorePorts = () =>
{
    const oldPorts = getOldPorts();
    const portInKeys = Object.keys(oldPorts.portsIn);
    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();
    for (let i = 0; i < portInKeys.length; i++)
    {
        const oldPortIn = oldPorts.portsIn[portInKeys[i]];
        const newPort = op.addInPort(new CABLES.Port(op, oldPortIn.name, oldPortIn.type));
        if (!wasPasted && Array.isArray(oldPortIn.links))
        {
            oldPortIn.links.forEach((link) =>
            {
                let parent = op.patch.getOpById(link.objOut);
                if (parent)
                {
                    const newLink = op.patch.link(parent, link.portOut, op, newPort.name);
                    if (newLink) newLink.ignoreInSerialize = true;
                }
                else
                {
                    parent = op.patch.ops.find((subOp) =>
                    {
                        return subOp.storage &&
                        subOp.storage.blueprint &&
                        subOp.storage.blueprint.originalOpId == link.objOut;
                    });
                    if (parent)
                    {
                        const newLink = op.patch.link(parent, link.portOut, op, newPort.name);
                        if (newLink) newLink.ignoreInSerialize = true;
                    }
                }
            });
        }
        if (!newPort.isLinked())
        {
            newPort.set(oldPortIn.value);
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
        if (!wasPasted && Array.isArray(oldPortOut.links))
        {
            oldPortOut.links.forEach((link) =>
            {
                let parent = op.patch.getOpById(link.objIn);
                if (parent)
                {
                    const newLink = op.patch.link(op, newPort.name, parent, link.portIn);
                    if (newLink) newLink.ignoreInSerialize = true;
                }
                else
                {
                    parent = op.patch.ops.find((subOp) =>
                    {
                        return subOp.storage &&
                        subOp.storage.blueprint &&
                        subOp.storage.blueprint.originalOpId == link.objIn;
                    });
                    if (parent)
                    {
                        const newLink = op.patch.link(op, newPort.name, parent, link.portIn);
                        if (newLink) newLink.ignoreInSerialize = true;
                    }
                }
            });
            if (!newPort.isLinked())
            {
                newPort.set(oldPortOut.value);
            }
            newPort.onLinkChanged = savePortData;

            if (oldPortOut.title)
            {
                newPort.setUiAttribs({ "title": oldPortOut.title });
            }
        }
    }
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
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
            op.setUiError("fetchOps", null);
            op.setUiError("inactive", "blueprint is inactive", 0);
            removeImportedOps();
            if (wasPasted) wasPasted = false;
        }
    }
};

op.onLoaded = () =>
{
    if (op.uiAttribs)
    {
        wasPasted = op.uiAttribs.pasted;
    }
    cleanupPorts();
    restorePorts();
};

op.onDelete = removeImportedOps;

function update()
{
    loadingOut.set(true);
    const patch = op.patch;
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();
    const blueprintId = patchId + "-" + subPatchId;

    loadingId = op.patch.loading.start("blueprint", blueprintId);

    if (patch.isEditorMode())
    {
        const options = {
            "blueprintId": blueprintId,
            "patchId": patchId,
            "subPatchId": subPatchId,
            "opId": op.id,
            "blueprintSubpatchId": op.uiAttribs.subPatch
        };

        CABLES.sandbox.getBlueprintOps(options, (err, response) =>
        {
            op.setUiError("fetchOps", null);
            if (!err)
            {
                removeImportedOps();
                const blueprintData = {};
                blueprintData.ops = response.data.ops;
                blueprintData.settings = op.patch.settings;
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
                    op.setUiError("fetchOps", "error fetching blueprint, code: " + err.code + " (" + err.msg + ")");
                }
            }
            loadingOut.set(false);
            op.patch.loading.finished(loadingId);
            if (wasPasted)
            {
                wasPasted = false;
            }
        });
    }
    else if (CABLES.talkerAPI)
    {
        // use this to workaround /viewer/ and /p/ not being "isEditorMode" but also not having exported assets
        const callbackTalkerApi = (options, next) =>
        {
            if (options.blueprint && options.blueprint.data.blueprintOpId === op.id)
            {
                const blueprintData = options.blueprint;
                blueprintData.settings = op.patch.settings;
                blueprintData.ops = blueprintData.data.ops;
                deSerializeBlueprint(blueprintData, subPatchId, false);
                loadingOut.set(false);
                op.patch.loading.finished(loadingId);
                if (wasPasted)
                {
                    wasPasted = false;
                }
                CABLES.talkerAPI.removeEventListener(callbackTalkerApi);
            }
        };
        CABLES.talkerAPI.addEventListener("blueprint", callbackTalkerApi);
        CABLES.talkerAPI.send("sendBlueprint", { "url": "/" + blueprintId + "/" + patchId + "/" + subPatchId + "/" + op.id + "/" + op.uiAttribs.subPatch });
    }
    else
    {
        let exportId = op.id;
        if (op.storage && op.storage.blueprint && op.storage.blueprint.originalOpId) exportId = op.storage.blueprint.originalOpId;
        const blueprintUrl = op.patch.config.prefixJsPath + "js/" + exportId + ".json";
        CABLES.ajax(
            blueprintUrl,
            function (err, data)
            {
                if (!err)
                {
                    const blueprintData = JSON.parse(data);
                    blueprintData.settings = op.patch.settings;
                    blueprintData.ops = blueprintData.ops;
                    deSerializeBlueprint(blueprintData, subPatchId, false);
                }
                else
                {
                    op.logError("failed to load blueprint from", blueprintUrl, err);
                }
                loadingOut.set(false);
                op.patch.loading.finished(loadingId);
                if (wasPasted)
                {
                    wasPasted = false;
                }
            }
        );
    }
}

function deSerializeBlueprint(data, subPatchId, editorMode)
{
    if (Array.isArray(data.ops) && data.ops.length > 0)
    {
        let listenerId;
        const cb = () =>
        {
            const parentSubPatch = op.patch.ops.find((subOp) =>
            {
                return subOp.storage &&
                subOp.storage.blueprint &&
                subOp.storage.blueprint.isParentSubPatch &&
                subOp.storage.blueprint.blueprintOpId == op.id;
            }
            );
            if (parentSubPatch)
            {
                op.setUiAttrib({ "extendTitle": parentSubPatch.uiAttribs.title });
                setupPorts(parentSubPatch);
            }
            op.patch.removeEventListener(listenerId);
        };


        if (editorMode)
        {
            gui.serverOps.loadProjectLibs(data, () =>
            {
                listenerId = op.patch.addEventListener("patchLoadEnd", cb);
                data.settings = op.patch.settings;
                data.namespace = op.patch.namespace;
                data.name = op.patch.name;
                op.patch.deSerialize(data, false);
                const originalSubPatchId = gui.patchView.getCurrentSubPatch();
                // gui.patchView.setCurrentSubPatch(subPatchId);
                gui.patchView.setCurrentSubPatch(originalSubPatchId);
            });
        }
        else
        {
            listenerId = op.patch.addEventListener("patchLoadEnd", cb);
            op.patch.deSerialize(data, false);
        }
    }
}

function removeImportedOps()
{
    const parentSubPatch = op.patch.ops.find((subOp) =>
    {
        return subOp.storage &&
        subOp.storage.blueprint &&
        subOp.storage.blueprint.isParentSubPatch &&
        subOp.storage.blueprint.blueprintOpId == op.id;
    }
    );
    if (parentSubPatch)
    {
        op.patch.deleteOp(parentSubPatch.id, parentSubPatch.storage.blueprint.blueprintOpId);
    }
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
    const subPatchDataPort = parentSubPatch.portsIn.find((port) => { return port.name === "dataStr"; });
    if (!subPatchDataPort) return;
    if (!subPatchDataPort.get()) return;

    const oldPorts = getOldPorts();
    cleanupPorts();

    const subPatchData = JSON.parse(subPatchDataPort.get());
    const subPatchPortsIn = subPatchData.ports || [];
    const subPatchPortsOut = subPatchData.portsOut || [];
    let i = 0;

    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();
    for (i = 0; i < subPatchPortsIn.length; i++)
    {
        if (!op.getPortByName(subPatchPortsIn[i].name))
        {
            const subPatchPort = parentSubPatch.portsIn.find((port) => { return port.name == subPatchPortsIn[i].name; });
            const newPort = op.addInPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));

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
                        savePortData();
                    };
                }
            }

            if (oldPorts.portsIn.hasOwnProperty(newPort.name))
            {
                if (!wasPasted && Array.isArray(oldPorts.portsIn[newPort.name].links))
                {
                    oldPorts.portsIn[newPort.name].links.forEach((link) =>
                    {
                        let parent = op.patch.getOpById(link.objOut);
                        if (parent)
                        {
                            const newLink = op.patch.link(parent, link.portOut, op, newPort.name);
                            if (newLink) newLink.ignoreInSerialize = true;
                        }
                        else
                        {
                            parent = op.patch.ops.find((subOp) =>
                            {
                                return subOp.storage &&
                                subOp.storage.blueprint &&
                                subOp.storage.blueprint.originalOpId == link.objOut;
                            });
                            if (parent)
                            {
                                const newLink = op.patch.link(parent, link.portOut, op, newPort.name);
                                if (newLink) newLink.ignoreInSerialize = true;
                            }
                        }
                    });
                }
                if (!newPort.isLinked())
                {
                    newPort.set(oldPorts.portsIn[newPort.name].value);
                }
            }
            newPort.onLinkChanged = savePortData;

            if (subPatchPort.title)
            {
                newPort.setUiAttribs({ "title": subPatchPortsIn[i].title });
            }
            else if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.title)
            {
                newPort.setUiAttribs({ "title": subPatchPort.uiAttribs.title });
            }
        }
    }

    for (i = 0; i < subPatchPortsOut.length; i++)
    {
        if (!op.getPortByName(subPatchPortsOut[i].name))
        {
            const patchPortIn = parentSubPatch.portsIn.find((port) => { return port.name === "patchId"; });
            const patchOutputOP = op.patch.getSubPatchOp(patchPortIn.value, "Ops.Ui.PatchOutput");
            if (patchOutputOP.portsIn)
            {
                const subPatchPort = patchOutputOP.portsIn.find((port) => { return port.name == subPatchPortsOut[i].name; });
                const newPort = op.addOutPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));

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
                            savePortData();
                        };
                    }
                    newPort.set(subPatchPort.get());
                }

                if (oldPorts.portsOut.hasOwnProperty(newPort.name))
                {
                    if (!wasPasted && Array.isArray(oldPorts.portsOut[newPort.name].links))
                    {
                        oldPorts.portsOut[newPort.name].links.forEach((link) =>
                        {
                            let parent = op.patch.getOpById(link.objIn);
                            if (parent)
                            {
                                const newLink = op.patch.link(op, newPort.name, parent, link.portIn);
                                if (newLink) newLink.ignoreInSerialize = true;
                            }
                            else
                            {
                                parent = op.patch.ops.find((subOp) =>
                                {
                                    return subOp.storage &&
                                    subOp.storage.blueprint &&
                                    subOp.storage.blueprint.originalOpId == link.objIn;
                                });
                                if (parent)
                                {
                                    const newLink = op.patch.link(op, newPort.name, parent, link.portIn);
                                    if (newLink) newLink.ignoreInSerialize = true;
                                }
                            }
                        });
                    }
                    if (!newPort.isLinked())
                    {
                        newPort.set(oldPorts.portsOut[newPort.name].value);
                    }
                }
                newPort.onLinkChanged = savePortData;

                if (subPatchPort.title)
                {
                    newPort.setUiAttribs({ "title": subPatchPortsOut[i].title });
                }
                else if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.title)
                {
                    newPort.setUiAttribs({ "title": subPatchPort.uiAttribs.title });
                }
            }
        }
    }
    savePortData();
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
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
                "value": port.get(),
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                link.ignoreInSerialize = true;
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
                "value": port.get(),
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                link.ignoreInSerialize = true;
                const linkData = {
                    "objIn": link.portIn.parent.id,
                    "portIn": link.portIn.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsOut[port.name] = portData;
        }
    });
    const serializedPortsData = JSON.stringify(newPortsData);
    portsData.set(serializedPortsData);
}

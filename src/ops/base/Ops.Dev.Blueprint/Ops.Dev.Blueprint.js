const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const activeIn = op.inBool("active", false);
const portsData = op.inString("portsData", "{}");

const loadingOut = op.outBool("loading", false);

let loadingId = null;
let initialLoadingId = op.patch.loading.start("blueprint_initial", op.id, op);

patchIdIn.setUiAttribs({
    "hidePort": true,
    "greyout": false
});
subPatchIdIn.setUiAttribs({
    "hidePort": true,
    "greyout": true
});
portsData.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hideParam": true });

let parentSubPatchId = null;

activeIn.setUiAttribs({ "order": 200 });

op.init = () =>
{
    op.setStorage({ "blueprintVer": 1 });
};

subPatchIdIn.onChange = () =>
{
    if (!activeIn.get())
    {
        op.setUiError("fetchOps", null);
    }
    if (!loadingOut.get() && activeIn.get() && patchIdIn.get() && subPatchIdIn.get())
    {
        op.updateBlueprint();
    }
};

if (op.patch.isEditorMode())
{
    patchIdIn.onChange = () =>
    {
        if (patchIdIn.get())
        {
            if (!activeIn.get())
            {
                op.setUiError("fetchOps", null);
            }
            if (!loadingOut.get() && activeIn.get() && subPatchIdIn.get())
            {
                op.updateBlueprint();
            }
        }
    };
}

const protectedPorts = [patchIdIn.id, subPatchIdIn.id, activeIn.id, portsData.id, loadingOut.id];

if (!activeIn.get())
{
    op.setUiError("inactive", "blueprint is inactive", 0);
}

activeIn.onChange = () =>
{
    if (!loadingOut.get())
    {
        if (activeIn.get())
        {
            op.setUiError("inactive", null);
            if (!patchLoadListener)
            {
                op.updateBlueprint();
            }
        }
        else
        {
            op.setUiError("fetchOps", null);
            op.setUiError("inactive", "blueprint is inactive", 0);
            removeImportedOps();
        }
    }
};

op.onLoadedValueSet = () =>
{
    cleanupPorts();
    if (!loadingOut.get() && op.uiAttribs.pasted)
    {
        op.updateBlueprint(op.uiAttribs.pasted);
    }
};

op.on("delete", removeImportedOps);

op.createBlueprint = (externalPatchId, subPatchId, active = true) =>
{
    patchIdIn.set(externalPatchId);
    subPatchIdIn.set(subPatchId);
    activeIn.set(active);
    cleanupPorts();
    if (!loadingOut.get())
    {
        op.updateBlueprint();
    }
};

op.updateBlueprint = (ignoreLinks = false) =>
{
    op.setUiError("fetchOps", null);

    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();
    const blueprintId = patchId + "-" + subPatchId;

    op.patch.off(patchLoadListener);
    patchLoadListener = null;

    if (!patchId || !subPatchId) return;

    loadingOut.set(true);

    loadingId = op.patch.loading.start("blueprint", op.id, op);
    if (initialLoadingId) op.patch.loading.finished(initialLoadingId);
    initialLoadingId = null;

    const doneCb = (err, serializedOps) =>
    {
        if (!err)
        {
            serializedOps.forEach((serializedOp) =>
            {
                addBlueprintInfoToOp(serializedOp);
            });

            removeImportedOps();
            const blueprintData = {};
            blueprintData.ops = serializedOps;
            deSerializeBlueprint(blueprintData, ignoreLinks);
        }
        else
        {
            op.uiAttribs.blueprintSubpatch = null;
            if (err.code === 403)
            {
                op.setUiError("fetchOps", "You do not have permission to use this Blueprint");
            }
            else if (err.code === 404)
            {
                op.setUiError("fetchOps", "Blueprint not found. Check that SubPatch exists in patch.");
            }
            else
            {
                op.setUiError("fetchOps", "Error fetching Blueprint, code: " + err.code + " (" + err.msg + ")");
            }
        }
        loadingOut.set(false);
        op.patch.loading.finished(loadingId);
    };

    if (op.patch.isEditorMode())
    {
        const isLocalSubpatch = ((patchId === gui.patchId) || (patchId === gui.project().shortId));
        if (isLocalSubpatch)
        {
            let err = null;
            const serializedOps = [];

            let subPatchOps = op.patch.getSubPatchOps(subPatchId, true);
            subPatchOps = subPatchOps.filter((subPatchOp) => { return !(subPatchOp.uiAttribs && subPatchOp.uiAttribs.blueprintOpId); });
            const localParent = getLocalParentSubPatchOp(subPatchId);
            if (localParent)
            {
                subPatchOps.push(localParent);
                subPatchOps.forEach((subPatchOp) =>
                {
                    serializedOps.push(subPatchOp.getSerialized());
                });
            }
            else
            {
                err = { "code": 404 };
            }

            doneCb(err, serializedOps);
        }
        else
        {
            const options = {
                "blueprintId": blueprintId
            };

            CABLES.sandbox.getBlueprintOps(options, (err, response) =>
            {
                op.setUiError("fetchOps", null);
                let subPatchOps = err ? [] : response.data.ops;
                doneCb(err, subPatchOps);
            });
        }
    }
    else
    {
        let exportId = blueprintId;
        if (CABLES.blueprints && CABLES.blueprints.hasOwnProperty(exportId))
        {
            const blueprintData = CABLES.blueprints[exportId];
            blueprintData.settings = op.patch.settings;
            // for some reason we have to do this in a 0ms timeout to make
            // sure nested blueprints are not loaded before this one created all the ops...
            setTimeout(() =>
            {
                deSerializeBlueprint(blueprintData, false);
                loadingOut.set(false);
                op.patch.loading.finished(loadingId);
            }, 0);
        }
        else
        {
            const blueprintUrl = op.patch.config.prefixJsPath + op.patch.getJsPath() + exportId + ".json";
            CABLES.ajax(
                blueprintUrl,
                function (err, data)
                {
                    if (!err)
                    {
                        const blueprintData = JSON.parse(data);
                        deSerializeBlueprint(blueprintData, false);
                    }
                    else
                    {
                        op.logError("failed to load blueprint from", blueprintUrl, err);
                    }
                    loadingOut.set(false);
                    op.patch.loading.finished(loadingId);
                }
            );
        }
    }
};

function addBlueprintInfoToOp(serializedOp)
{
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();

    if (!serializedOp.storage) serializedOp.storage = {};
    if (!serializedOp.storage.blueprint) serializedOp.storage.blueprint = {};

    if (!serializedOp.objName && CABLES.OPS.hasOwnProperty(serializedOp.opId)) serializedOp.objName = CABLES.OPS[serializedOp.opId].objName;
    serializedOp.storage.blueprint.patchId = patchId;

    if (serializedOp.storage && serializedOp.storage.subPatchVer)
    {
        const subPatchPort = serializedOp.portsIn.find((port) => { return port.name === "patchId" && port.value === subPatchId; });
        if (subPatchPort)
        {
            serializedOp.storage.blueprint.isParentSubPatch = true;
            serializedOp.uiAttribs.hidden = true;
            if (!serializedOp.uiAttribs.translate) serializedOp.uiAttribs.translate = {};
            serializedOp.uiAttribs.translate.x = -9999999;
            serializedOp.uiAttribs.translate.y = -9999999;
        }
    }
}

function deSerializeBlueprint(data, ignoreLinks = false)
{
    const editorMode = op.patch.isEditorMode();

    const doneCb = (patchData) =>
    {
        patchData.ops.forEach((replacedOp) =>
        {
            if (!replacedOp.uiAttribs) replacedOp.uiAttribs = {};
            replacedOp.uiAttribs.blueprintOpId = op.id;
            if (replacedOp.storage && replacedOp.storage.blueprintVer)
            {
                replacedOp.uiAttribs.pasted = true;
            }
        });
        const parentSubPatch = patchData.ops.find((op) =>
        {
            let isParent = false;
            if (op.storage && op.storage.blueprint && op.storage.blueprint.isParentSubPatch) isParent = true;
            return isParent;
        });
        let blueprintSubpatch = null;

        if (parentSubPatch)
        {
            parentSubPatchId = parentSubPatch.id;
            const patchIdPort = parentSubPatch.portsIn.find((port) => { return port.name === "patchId"; });
            if (patchIdPort) blueprintSubpatch = patchIdPort.value;
            op.uiAttribs.blueprintSubpatch = blueprintSubpatch;
            op.patch.deSerialize(patchData, false);
        }
    };

    if (Array.isArray(data.ops) && data.ops.length > 0)
    {
        let originalSaveState = null;
        data = CABLES.Patch.replaceOpIds(data, { "parentSubPatchId": op.uiAttribs.subPatch, "prefixhash": op.id });
        if (editorMode)
        {
            originalSaveState = gui.getSavedState();
            CABLES.UI.undo.pause();

            gui.serverOps.loadProjectDependencies(data, () =>
            {
                doneCb(data);
                const originalSubPatchId = gui.patchView.getCurrentSubPatch();
                gui.patchView.setCurrentSubPatch(originalSubPatchId);

                const pSubPatch = op.patch.getOpById(parentSubPatchId);
                if (pSubPatch)
                {
                    op.setUiAttrib({ "extendTitle": pSubPatch.uiAttribs.title });
                    gui.corePatch().emitEvent("subpatchesChanged");
                }
                setupPorts(parentSubPatchId, ignoreLinks);
                CABLES.UI.undo.resume();
                if (originalSaveState === true)
                {
                    gui.setStateSaved();
                }
            });
        }
        else
        {
            const parentSubPatchData = data.ops.find((op) =>
            {
                let isParent = false;
                if (op.storage && op.storage.blueprint && op.storage.blueprint.isParentSubPatch) isParent = true;
                return isParent;
            });
            if (parentSubPatchData)
            {
                parentSubPatchId = parentSubPatchData.id;
            }
            doneCb(data);
            setupPorts(parentSubPatchId);
        }
    }
}

function removeImportedOps()
{
    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();
    const toDelete = op.patch.ops.filter((theOp) => { return theOp.uiAttribs && theOp.uiAttribs.blueprintOpId === op.id; }).reverse();
    toDelete.forEach((theOp) =>
    {
        op.patch.deleteOp(theOp.id);
    });
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
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
    return {
        "portsIn": oldPortsIn,
        "portsOut": oldPortsOut
    };
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
        op.emitEvent("onPortRemoved", {});
    });

    removeOutPorts.forEach((port) =>
    {
        removeOutPort(port);
        op.emitEvent("onPortRemoved", {});
    });

    if (removeOutPorts.length > 0 || removeInPorts.length > 0)
    {
        op.emitEvent("onUiAttribsChange", {});
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

function setupPorts(subPatchId, ignoreLinks = false)
{
    if (!subPatchId) return;
    const subPatch = op.patch.getOpById(subPatchId);
    if (!subPatch) return;
    const subPatchDataPort = subPatch.portsIn.find((port) => { return port.name === "dataStr"; });
    if (!subPatchDataPort) return;
    if (!subPatchDataPort.get()) return;

    const oldPorts = getOldPorts();
    cleanupPorts();

    const subPatchData = JSON.parse(subPatchDataPort.get());
    const subPatchPortsIn = subPatchData.ports || [];
    const subPatchPortsOut = subPatchData.portsOut || [];
    let i = 0;

    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();

    const newPorts = [];
    for (i = 0; i < subPatchPortsIn.length; i++)
    {
        if (!op.getPortByName(subPatchPortsIn[i].name))
        {
            const subPatchPort = subPatch.portsIn.find((port) => { return port.name === subPatchPortsIn[i].name; });
            if (subPatchPort)
            {
                const newPort = op.addInPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));
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
                        if (!newPort.isLinked())
                        {
                            savePortData();
                        }
                    };
                }

                if (!ignoreLinks && oldPorts.portsIn.hasOwnProperty(newPort.name))
                {
                    if (Array.isArray(oldPorts.portsIn[newPort.name].links))
                    {
                        oldPorts.portsIn[newPort.name].links.forEach((link) =>
                        {
                            const bpId = op.uiAttribs.blueprintOpId || op.id;
                            let opId = CABLES.prefixedHash(bpId + link.objOut);
                            let parent = op.patch.getOpById(opId) || op.patch.getOpById(link.objOut);
                            if (parent && parent.getPortByName(link.portOut))
                            {
                                const newLink = op.patch.link(parent, link.portOut, op, newPort.name);
                                if (newLink) newLink.ignoreInSerialize = true;
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
                if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.objType)
                {
                    newPort.setUiAttribs({ "objType": subPatchPort.uiAttribs.objType });
                }
                newPorts.push(newPort);
            }
        }
    }
    op.setPortGroup("Blueprint Ports", newPorts);

    for (i = 0; i < subPatchPortsOut.length; i++)
    {
        if (!op.getPortByName(subPatchPortsOut[i].name))
        {
            const patchPortIn = subPatch.portsIn.find((port) => { return port.name === "patchId"; });
            const patchOutputOP = op.patch.getSubPatchOp(patchPortIn.value, "Ops.Ui.PatchOutput");
            if (patchOutputOP.portsIn)
            {
                const subPatchPort = patchOutputOP.portsIn.find((port) => { return port.name == subPatchPortsOut[i].name; });
                if (subPatchPort)
                {
                    const newPort = op.addOutPort(new CABLES.Port(op, subPatchPort.name, subPatchPort.type));
                    newPort.ignoreValueSerialize = true;

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

                    if (!ignoreLinks && oldPorts.portsOut.hasOwnProperty(newPort.name))
                    {
                        if (Array.isArray(oldPorts.portsOut[newPort.name].links))
                        {
                            oldPorts.portsOut[newPort.name].links.forEach((link) =>
                            {
                                const bpId = op.uiAttribs.blueprintOpId || op.id;
                                let opId = CABLES.prefixedHash(bpId + link.objIn);
                                let parent = op.patch.getOpById(opId) || op.patch.getOpById(link.objIn);
                                if (parent && parent.getPortByName(link.portIn))
                                {
                                    const newLink = op.patch.link(op, newPort.name, parent, link.portIn);
                                    if (newLink) newLink.ignoreInSerialize = true;
                                }
                            });
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

                    if (subPatchPort.uiAttribs && subPatchPort.uiAttribs.objType)
                    {
                        newPort.setUiAttribs({ "objType": subPatchPort.uiAttribs.objType });
                    }
                }
            }
        }
    }
    savePortData();
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
}

function savePortData()
{
    const newPortsData = {
        "portsIn": {},
        "portsOut": {}
    };
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
            if (!port.links || port.links.length === 0) portData.value = port.get();
            port.links.forEach((link) =>
            {
                link.ignoreInSerialize = true;
                const linkData = {
                    "objOut": link.portOut.op.id,
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
            if (!port.links || port.links.length === 0)
            {
                let portValue = port.get();
                try
                {
                    JSON.stringify(portValue);
                }
                catch (e)
                {
                    portValue = null;
                }
                portData.value = portValue;
            }
            port.links.forEach((link) =>
            {
                link.ignoreInSerialize = true;
                const linkData = {
                    "objIn": link.portIn.op.id,
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

function getLocalParentSubPatchOp(subPatchId)
{
    if (!subPatchId) return null;
    return op.patch.ops.find((op) =>
    {
        // if (CABLES.Op.isSubPatchOpName(op.objName))
        if (op.storage && op.storage.subPatchVer)
        {
            const subPatchPort = op.portsIn.find((port) => { return port.name === "patchId" && port.value === subPatchId; });
            if (subPatchPort) return true;
        }
    });
}

let patchLoadListener = op.patch.on("patchLoadEnd", (newOps, obj, genIds) =>
{
    op.patch.off(patchLoadListener);
    const isRelevant = newOps.some((newOp) => { return newOp.id === op.id || (newOp.uiAttribs && newOp.uiAttribs.subPatch === subPatchIdIn.get()); });
    if (isRelevant)
    {
        op.updateBlueprint();
    }
});

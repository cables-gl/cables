import { CONSTANTS } from "./constants";
import Logger from "./core_logger";

const PatchConnectionReceiver = function (patch, options, connector)
{
    this._patch = patch;
    this.connector = connector;
    this._log = new Logger("PatchConnectionReceiver");
};

PatchConnectionReceiver.prototype._addOp = function (data)
{
    let uiAttribs = null;
    if (data.vars.uiAttribs) uiAttribs = data.vars.uiAttribs;
    const op = this._patch.addOp(data.vars.objName, uiAttribs, data.vars.opId, true);
    if (op)
    {
        op.id = data.vars.opId;
        if (data.vars.portsIn)
        {
            data.vars.portsIn.forEach((portInfo) =>
            {
                const port = op.getPortByName(portInfo.name);
                if (port) port.set(portInfo.value);
            });
        }
    }
};

PatchConnectionReceiver.prototype._receive = function (ev)
{
    let data = {};
    if (ev.hasOwnProperty("event")) data = ev;
    else data = JSON.parse(ev.data);

    if (data.event == CONSTANTS.PACO.PACO_OP_CREATE)
    {
        if (this._patch.getOpById(data.vars.opId)) return;
        this._log.verbose("op create:", data.vars.objName);

        if (window.gui)
        {
            gui.serverOps.loadOpLibs(data.vars.objName, () =>
            {
                this._addOp(data);
            });
        }
        else
        {
            this._addOp(data);
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_DESERIALIZE)
    {
        if (data.vars.json)
        {
            if (window.gui)
            {
                gui.serverOps.loadProjectDependencies(data.vars.json, () =>
                {
                    this._patch.deSerialize(data.vars.json, { "genIds": data.vars.genIds });
                });
            }
            else
            {
                this._patch.deSerialize(data.vars.json, { "genIds": data.vars.genIds });
            }
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_LOAD)
    {
        this._log.verbose("PACO load patch.....");
        this._patch.clear();
        if (window.gui)
        {
            gui.serverOps.loadProjectDependencies(JSON.parse(data.vars.patch), () =>
            {
                this._patch.deSerialize(data.vars.patch);
            });
        }
        else
        {
            this._patch.deSerialize(data.vars.patch);
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_CLEAR)
    {
        this._patch.clear();
        this._log.log("clear");
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_DELETE)
    {
        this._log.verbose("op delete", data.vars.objName);
        const op = this._patch.getOpById(data.vars.op);
        this._patch.deleteOp(data.vars.op, true);
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_ENABLE)
    {
        const op = this._patch.getOpById(data.vars.op);
        if (op) op.enabled = true;
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_DISABLE)
    {
        const op = this._patch.getOpById(data.vars.op);
        if (op) op.enabled = false;
    }
    else if (data.event == CONSTANTS.PACO.PACO_UIATTRIBS)
    {
        const op = this._patch.getOpById(data.vars.op);
        op?.setUiAttrib(data.vars.uiAttribs);
    }
    else if (data.event == CONSTANTS.PACO.PACO_UNLINK)
    {
        const op1 = this._patch.getOpById(data.vars.op1);
        const op2 = this._patch.getOpById(data.vars.op2);
        // if (!op1 || !op2) return;
        const port1 = op1?.getPort(data.vars.port1);
        const port2 = op2?.getPort(data.vars.port2);

        if (port1 && port2) port1.removeLinkTo(port2);
        else this._log.warn("paco unlink could not find port...");
    }
    else if (data.event == CONSTANTS.PACO.PACO_LINK)
    {
        const op1 = this._patch.getOpById(data.vars.op1);
        const op2 = this._patch.getOpById(data.vars.op2);
        if (op1 && op2) this._patch.link(op1, data.vars.port1, op2, data.vars.port2);
    }
    else if (data.event == CONSTANTS.PACO.PACO_VALUECHANGE)
    {
        // do not handle variable creation events
        if (data.vars.v === "+ create new one") return;
        const op = this._patch.getOpById(data.vars.op);
        if (op)
        {
            const p = op.getPort(data.vars.port);
            if (p) p.set(data.vars.v);
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_VARIABLES)
    {
        const op = this._patch.getOpById(data.vars.opId);
        if (op)
        {
            if (op.varName) op.varName.set(data.vars.varName);
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_TRIGGERS)
    {
        const op = this._patch.getOpById(data.vars.opId);
        if (op)
        {
            if (op.varName) op.varName.set(data.vars.varName);
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_PORT_SETVARIABLE)
    {
        const op = this._patch.getOpById(data.vars.opId);
        if (op)
        {
            const p = op.getPortByName(data.vars.portName);
            if (p) p.setVariable(data.vars.variableName);
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_PORT_SETANIMATED)
    {
        const op = this._patch.getOpById(data.vars.opId);
        if (op)
        {
            const p = op.portsIn[data.vars.portIndex];
            if (p)
            {
                if (data.vars.hasOwnProperty("targetState"))
                {
                    this._patch.emitEvent("pacoPortValueSetAnimated", op, data.vars.portIndex, data.vars.targetState, data.vars.defaultValue);
                }
            }
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_PORT_ANIM_UPDATED)
    {
        const op = this._patch.getOpById(data.vars.opId);
        if (op)
        {
            const p = op.getPortByName(data.vars.portName);
            if (p)
            {
                const objPort = p.getSerialized();
                objPort.anim = data.vars.anim;
                p.anim = null;
                p.deSerializeSettings(objPort);
                this._patch.emitEvent("pacoPortAnimUpdated", p);
            }
        }
    }
    else
    {
        this._log.warn("unknown patchConnectionEvent!", ev);
    }
};


// ---------------


const PatchConnectionSender = function (patch)
{
    this.connectors = [];
    this.paused = false;

    patch.addEventListener("onOpDelete",
        (op) =>
        {
            this.send(CABLES.PACO_OP_DELETE, { "op": op.id, "objName": op.objName });
        });

    patch.addEventListener("patchClearStart", () =>
    {
        this.paused = true;
    });

    patch.addEventListener("patchClearEnd",
        () =>
        {
            this.paused = false;
        });

    patch.addEventListener("patchLoadStart", () =>
    {
        this.paused = true;
    });

    patch.addEventListener("patchLoadEnd",
        (newOps, json, genIds) =>
        {
            this.paused = false;
            this.send(CABLES.PACO_DESERIALIZE, { "json": json, "genIds": genIds });
        });

    patch.addEventListener("onOpAdd",
        (op) =>
        {
            const portsIn = [];
            op.portsIn.forEach((portIn) =>
            {
                const port = {
                    "id": portIn.id,
                    "name": portIn.name,
                    "value": portIn.get()
                };
                portsIn.push(port);
            });
            let newUiAttribs = { };
            if (op.uiAttribs)
            {
                newUiAttribs = { ...op.uiAttribs };
            }
            this.send(CABLES.PACO_OP_CREATE, {
                "opId": op.id,
                "objName": op.objName,
                "uiAttribs": newUiAttribs,
                "portsIn": portsIn
            });
        });

    patch.addEventListener("onUnLink", (p1, p2) =>
    {
        this.send(CABLES.PACO_UNLINK, {
            "op1": p1.op.id,
            "op2": p2.op.id,
            "port1": p1.getName(),
            "port2": p2.getName()
        });
    });

    patch.addEventListener("onUiAttribsChange", (op, newAttribs) =>
    {
        if (!newAttribs) return;

        delete newAttribs.extendTitle;
        delete newAttribs.history;
        delete newAttribs.translate;
        if (Object.keys(newAttribs).length > 0)
        {
            this.send(CABLES.PACO_UIATTRIBS, { "op": op.id, "uiAttribs": newAttribs });
        }
    });

    patch.addEventListener("opVariableNameChanged", (op, varName) =>
    {
        const vars = {
            "opId": op.id,
            "varName": varName
        };
        this.send(CABLES.PACO_VARIABLES, vars);
    });

    patch.addEventListener("opTriggerNameChanged", (op, varName) =>
    {
        const vars = {
            "opId": op.id,
            "varName": varName
        };
        this.send(CABLES.PACO_TRIGGERS, vars);
    });

    patch.addEventListener("onLink", (p1, p2) =>
    {
        this.send(CABLES.PACO_LINK, {
            "op1": p1.op.id,
            "op2": p2.op.id,
            "port1": p1.name,
            "port2": p2.name
        });
    });

    patch.addEventListener("portSetVariable", (op, port, variableName) =>
    {
        const vars = {
            "opId": op.id,
            "portName": port.name,
            "variableName": variableName
        };
        this.send(CABLES.PACO_PORT_SETVARIABLE, vars);
    });

    patch.addEventListener("portAnimUpdated", (op, port, anim) =>
    {
        if (op && port)
        {
            const vars = {
                "opId": op.id,
                "portName": port.name,
                "anim": anim.getSerialized()
            };
            this.send(CABLES.PACO_PORT_ANIM_UPDATED, vars);
        }
    });
};

PatchConnectionSender.prototype.send = function (event, vars)
{
    if (this.paused) return;
    // do not send variable creation events
    if (event === CABLES.PACO_VALUECHANGE && vars.v === "+ create new one") return;
    for (let i = 0; i < this.connectors.length; i++)
    {
        this.connectors[i].send(event, vars);
    }
};

// -------------

const PatchConnectorBroadcastChannel = function ()
{
    if (!window.BroadcastChannel) return;

    this.bc = new BroadcastChannel("test_channel");
};

PatchConnectorBroadcastChannel.prototype.receive = function (paco)
{
    if (!this.bc) return;
    this._log.log("init");
    this.bc.onmessage = paco._receive.bind(paco);
};

PatchConnectorBroadcastChannel.prototype.send = function (event, vars)
{
    if (!this.bc) return;
    const data = {};
    data.event = event;
    data.vars = vars;
    this.bc.postMessage(JSON.stringify(data));
};

export {
    PatchConnectionReceiver, PatchConnectionSender, PatchConnectorBroadcastChannel
};

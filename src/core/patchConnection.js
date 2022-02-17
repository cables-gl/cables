import { CONSTANTS } from "./constants";
import Logger from "./core_logger";

// export const togglePacoRenderer = function ()
// {
//     var show = CABLES.UI.userSettings.get("pacoRenderer") || false;
//     CABLES.UI.userSettings.set("pacoRenderer", !show);
//     document.location.reload();
// };
// export const showPacoRenderer = function ()
// {
// };

const PatchConnectionReceiver = function (patch, options, connector)
{
    this._patch = patch;
    this.connector = connector;
    this._log = new Logger("PatchConnectionReceiver");

    // this.connector.receive(this);
};

PatchConnectionReceiver.prototype._receive = function (ev)
{
    let data = {};
    if (ev.hasOwnProperty("event")) data = ev;
    else data = JSON.parse(ev.data);

    if (data.event == CONSTANTS.PACO.PACO_OP_CREATE)
    {
        this._log.log("op create:", data.vars.objName);
        if (this._patch.getOpById(data.vars.opId)) return;

        let op = null;

        if (window.gui)
        {
            gui.serverOps.loadOpLibs(data.vars.objName, () =>
            {
                op = this._patch.addOp(data.vars.objName, null, data.vars.opId);
                if (op)
                {
                    op.id = data.vars.opId;
                    op.uiAttribs = { ...op.uiAttribs, ...data.vars.uiAttribs };
                    if (data.vars.portsIn)
                    {
                        data.vars.portsIn.forEach((portInfo) =>
                        {
                            const port = op.getPortByName(portInfo.name);
                            if (port) port.set(portInfo.value);
                        });
                    }
                }
            });
        }
        else
        {
            op = this._patch.addOp(data.vars.objName, null, data.vars.opId);
            if (op)
            {
                op.id = data.vars.opId;
                op.uiAttribs = { ...op.uiAttribs, ...data.vars.uiAttribs };
                if (data.vars.portsIn)
                {
                    data.vars.portsIn.forEach((portInfo) =>
                    {
                        const port = op.getPortByName(portInfo.name);
                        if (port) port.set(portInfo.value);
                    });
                }
            }
        }
    }
    else if (data.event == CONSTANTS.PACO.PACO_LOAD)
    {
        this._log.log("PACO load patch.....");
        this._patch.clear();
        if (window.gui)
        {
            gui.serverOps.loadProjectLibs(JSON.parse(data.vars.patch), () =>
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
        this._log.log("op delete", data.vars.objName);
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
        if (op) op.setUiAttrib(data.vars.uiAttribs);
    }
    else if (data.event == CONSTANTS.PACO.PACO_UNLINK)
    {
        const op1 = this._patch.getOpById(data.vars.op1);
        const op2 = this._patch.getOpById(data.vars.op2);
        if (!op1 || !op2)
        {
            console.log("[paco] unlink op not found ");
            return;
        }
        const port1 = op1.getPort(data.vars.port1);
        const port2 = op2.getPort(data.vars.port2);

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
    else
    {
        this._log.warn("unknown patchConnectionEvent!", ev);
    }
};


// ---------------


const PatchConnectionSender = function (patch)
{
    this.connectors = [];
    // this.connectors.push(new PatchConnectorBroadcastChannel());

    patch.addEventListener("onOpDelete",
        (op) =>
        {
            this.send(CABLES.PACO_OP_DELETE, { "op": op.id, "objName": op.objName });
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
            op.uiAttribs.fromNetwork = true;
            this.send(CABLES.PACO_OP_CREATE, {
                "opId": op.id,
                "objName": op.objName,
                "uiAttribs": op.uiAttribs,
                "portsIn": portsIn
            });
        });

    patch.addEventListener("onUnLink", (p1, p2) =>
    {
        this.send(CABLES.PACO_UNLINK, {
            "op1": p1.parent.id,
            "op2": p2.parent.id,
            "port1": p1.getName(),
            "port2": p2.getName()
        });
    });

    patch.addEventListener("onUiAttribsChange", (op) =>
    {
        this.send(CABLES.PACO_UIATTRIBS, { "op": op.id, "uiAttribs": op.uiAttribs });
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
            "op1": p1.parent.id,
            "op2": p2.parent.id,
            "port1": p1.name,
            "port2": p2.name,
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
};

PatchConnectionSender.prototype.send = function (event, vars)
{
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
    // this._log.log(data);
};


// -------------

// const PatchConnectorSocketIO = function ()
// {
//     this._socket = io("localhost:5712");
//     this._log.log("socket io paco...");
//     this._socket.emit("channel", { name: "hund" });

//     this._socket.on("connect", () =>
//     {
//         this._log.log("CONNECTED");
//         // connection.set(socket);
//         // connected.set(true);
//     });

//     this._socket.on("reconnect_error", () =>
//     {
//         this._log.log("reconnect_error");
//         // connected.set(false);
//     });

//     this._socket.on("connect_error", () =>
//     {
//         this._log.log("connect_error");
//         // connected.set(false);
//     });

//     this._socket.on("error", () =>
//     {
//         this._log.log("socket error");
//         // connected.set(false);
//     });
// };

// PatchConnectorSocketIO.prototype.receive = function (paco)
// {
//     this._socket.on("event", (r) =>
//     {
//         this._log.log("socket io receive", r);
//         paco._receive(r.data);
//     });
// };

// PatchConnectorSocketIO.prototype.send = function (event, vars)
// {
//     this._log.log("send socketio");
//     var data = {};
//     data.event = event;
//     data.vars = vars;

//     this._socket.emit("event", {
//         msg: "paco event",
//         event,
//         data,
//     });
// };

export {
    PatchConnectionReceiver, PatchConnectionSender, PatchConnectorBroadcastChannel,
};

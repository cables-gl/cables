import { CONSTANTS } from "./constants";
import { Log } from "./log"

// todo: this is optional?

export const togglePacoRenderer = function ()
{
    var show = CABLES.UI.userSettings.get("pacoRenderer") || false;
    CABLES.UI.userSettings.set("pacoRenderer", !show);
    document.location.reload();
};

export const showPacoRenderer = function ()
{

};

const PatchConnectionReceiver = function (patch, options, connector)
{
    this._patch = patch;

    if (connector)
    {
        this.connector = connector;
    }
    else
    {
        this.connector = new PatchConnectorBroadcastChannel();
    }
    this.connector.receive(this);
};

PatchConnectionReceiver.prototype._receive = function (ev)
{
    console.log("ev", ev);
    var data = {};
    if (ev.hasOwnProperty('event')) data = ev;
    else data = JSON.parse(ev.data);

    if (data.event == CONSTANTS.PACO.PACO_OP_CREATE)
    {
        Log.log("op create: data.vars.objName");
        if(this._patch.getOpById(data.vars.opId))return;
        var op = this._patch.addOp(data.vars.objName,null,data.vars.opId);
        op.id = data.vars.opId;
    }
    else if (data.event == CONSTANTS.PACO.PACO_LOAD)
    {
        Log.log("PACO load patch.....");
        this._patch.clear();
        this._patch.deSerialize(data.vars.patch);
        gui.patch().updateSubPatches();
    }
    else if (data.event == CONSTANTS.PACO.PACO_CLEAR)
    {
        this._patch.clear();
        Log.log("clear");
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_DELETE)
    {
        Log.log("op delete");
        this._patch.deleteOp(data.vars.op, true);
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_ENABLE)
    {
        var op = this._patch.getOpById(data.vars.op);
        if (op) op.enabled = true;
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_DISABLE)
    {
        var op = this._patch.getOpById(data.vars.op);
        if (op) op.enabled = false;
    }
    else if (data.event == CONSTANTS.PACO.PACO_UNLINK)
    {
        var op1 = this._patch.getOpById(data.vars.op1);
        var op2 = this._patch.getOpById(data.vars.op2);
        if(!op1 || !op2)
        {
            console.log('[paco] unlink op not found ');
            return;
        }
        var port1 = op1.getPort(data.vars.port1);
        var port2 = op2.getPort(data.vars.port2);
        port1.removeLinkTo(port2);
    }
    else if (data.event == CONSTANTS.PACO.PACO_LINK)
    {
        var op1 = this._patch.getOpById(data.vars.op1);
        var op2 = this._patch.getOpById(data.vars.op2);
        this._patch.link(op1, data.vars.port1, op2, data.vars.port2);
    }
    else if (data.event == CONSTANTS.PACO.PACO_VALUECHANGE)
    {
        var op = this._patch.getOpById(data.vars.op);
        var p = op.getPort(data.vars.port);
        p.set(data.vars.v);
    }
    else
    {
        Log.log("unknown patchConnectionEvent!", ev);
    }
};


// ---------------


const PatchConnectionSender = function (patch)
{
    this.connectors = [];
    this.connectors.push(new PatchConnectorBroadcastChannel());

    patch.addEventListener("onOpDelete",
        (op) => {
            this.send(CABLES.PACO_OP_DELETE, { "op": op.id });
        });

    patch.addEventListener("onOpAdd",
        (op) =>
        {
            this.send(CABLES.PACO_OP_CREATE, {
                "opId": op.id,
                "objName": op.objName
            });
        });

    patch.addEventListener("onUnLink",(p1, p2) => {
        this.send(CABLES.PACO_UNLINK, {
            "op1": p1.parent.id,
            "op2": p2.parent.id,
            "port1": p1.getName(),
            "port2": p2.getName()
        });
    });

    patch.addEventListener("onLink",(p1, p2) => {
        this.send(CABLES.PACO_LINK, {
            "op1": p1.parent.id,
            "op2": p2.parent.id,
            "port1": p1.name,
            "port2": p2.name,
        });
    });

};

PatchConnectionSender.prototype.send = function (event, vars)
{
    for (var i = 0; i < this.connectors.length; i++)
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
    Log.log("init");
    this.bc.onmessage = paco._receive.bind(paco);
};

PatchConnectorBroadcastChannel.prototype.send = function (event, vars)
{
    if (!this.bc) return;
    var data = {};
    data.event = event;
    data.vars = vars;
    this.bc.postMessage(JSON.stringify(data));
    // Log.log(data);
};





// -------------

// const PatchConnectorSocketIO = function ()
// {
//     this._socket = io("localhost:5712");
//     Log.log("socket io paco...");
//     this._socket.emit("channel", { name: "hund" });

//     this._socket.on("connect", () =>
//     {
//         Log.log("CONNECTED");
//         // connection.set(socket);
//         // connected.set(true);
//     });

//     this._socket.on("reconnect_error", () =>
//     {
//         Log.log("reconnect_error");
//         // connected.set(false);
//     });

//     this._socket.on("connect_error", () =>
//     {
//         Log.log("connect_error");
//         // connected.set(false);
//     });

//     this._socket.on("error", () =>
//     {
//         Log.log("socket error");
//         // connected.set(false);
//     });
// };

// PatchConnectorSocketIO.prototype.receive = function (paco)
// {
//     this._socket.on("event", (r) =>
//     {
//         Log.log("socket io receive", r);
//         paco._receive(r.data);
//     });
// };

// PatchConnectorSocketIO.prototype.send = function (event, vars)
// {
//     Log.log("send socketio");
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

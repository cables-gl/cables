import { CONSTANTS } from "./constants";

// todo: this is optional?

export const togglePacoRenderer = function ()
{
    var show = CABLES.UI.userSettings.get("pacoRenderer") || false;
    CABLES.UI.userSettings.set("pacoRenderer", !show);
    document.location.reload();
};

export const showPacoRenderer = function ()
{
    // if(CABLES.UI.userSettings.get("pacoRenderer"))
    // {
    //     $('body').append('<iframe class="paco-iframe" style="z-index:9999999;" src="/renderer/"></iframe>');
    // }
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
    var data = {};
    if (ev.event) data = ev;
    else data = JSON.parse(ev.data);

    // console.log(data);

    if (data.event == CONSTANTS.PACO.PACO_OP_CREATE)
    {
        console.log("op create: data.vars.objName");
        var op = this._patch.addOp(data.vars.objName);
        op.id = data.vars.opId;
    }
    else if (data.event == CONSTANTS.PACO.PACO_LOAD)
    {
        console.log("load patch.....");
        this._patch.clear();
        this._patch.deSerialize(data.vars.patch);
    }
    else if (data.event == CONSTANTS.PACO.PACO_CLEAR)
    {
        this._patch.clear();
        console.log("clear");
    }
    else if (data.event == CONSTANTS.PACO.PACO_OP_DELETE)
    {
        console.log("op delete");
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
        console.log("unknown patchConnectionEvent!", ev);
    }
};

const PatchConnectionSender = function (patch, options)
{
    this.connectors = [];
    this.connectors.push(new PatchConnectorBroadcastChannel());
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
    console.log("init");
    this.bc.onmessage = paco._receive.bind(paco);
};

PatchConnectorBroadcastChannel.prototype.send = function (event, vars)
{
    if (!this.bc) return;
    var data = {};
    data.event = event;
    data.vars = vars;
    this.bc.postMessage(JSON.stringify(data));
    // console.log(data);
};

// -------------

// const PatchConnectorSocketIO = function ()
// {
//     this._socket = io("localhost:5712");
//     console.log("socket io paco...");
//     this._socket.emit("channel", { name: "hund" });

//     this._socket.on("connect", () =>
//     {
//         console.log("CONNECTED");
//         // connection.set(socket);
//         // connected.set(true);
//     });

//     this._socket.on("reconnect_error", () =>
//     {
//         console.log("reconnect_error");
//         // connected.set(false);
//     });

//     this._socket.on("connect_error", () =>
//     {
//         console.log("connect_error");
//         // connected.set(false);
//     });

//     this._socket.on("error", () =>
//     {
//         console.log("socket error");
//         // connected.set(false);
//     });
// };

// PatchConnectorSocketIO.prototype.receive = function (paco)
// {
//     this._socket.on("event", (r) =>
//     {
//         console.log("socket io receive", r);
//         paco._receive(r.data);
//     });
// };

// PatchConnectorSocketIO.prototype.send = function (event, vars)
// {
//     console.log("send socketio");
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

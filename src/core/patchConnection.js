var CABLES=CABLES || {};

CABLES.PACO_CLEAR=0;
CABLES.PACO_VALUECHANGE=1;
CABLES.PACO_OP_DELETE=2;
CABLES.PACO_UNLINK=3;
CABLES.PACO_LINK=4;
CABLES.PACO_LOAD=5;
CABLES.PACO_OP_CREATE=6;
CABLES.PACO_OP_ENABLE=7;
CABLES.PACO_OP_DISABLE=8;

CABLES.togglePacoRenderer=function()
{
    var show=CABLES.UI.userSettings.get("pacoRenderer") || false;
    CABLES.UI.userSettings.set("pacoRenderer",!show);
    document.location.reload();
};

CABLES.showPacoRenderer=function()
{
    // if(CABLES.UI.userSettings.get("pacoRenderer"))
    // {
    //     $('body').append('<iframe class="paco-iframe" style="z-index:9999999;" src="/renderer/"></iframe>');
    // }
}

CABLES.PatchConnectionReceiver=function(patch,options,connector)
{
    this._patch=patch;

    if(connector)
    {
        this.connector=connector;
    }
    else
    {
        this.connector=new CABLES.PatchConnectorBroadcastChannel();
    }
    this.connector.receive(this);
};

CABLES.PatchConnectionReceiver.prototype._receive=function(ev)
{
    var data={};
    if(ev.event)data=ev;
    else data=JSON.parse(ev.data);

    // console.log(data);

    if(data.event==CABLES.PACO_OP_CREATE)
    {
        console.log("op create: data.vars.objName");
        var op=this._patch.addOp(data.vars.objName);
        op.id=data.vars.opId;
    }
    else
    if(data.event==CABLES.PACO_LOAD)
    {
        console.log("load patch.....");
        this._patch.clear();
        this._patch.deSerialize(data.vars.patch);
    }
    else
    if(data.event==CABLES.PACO_CLEAR)
    {
        this._patch.clear();
        console.log('clear');
    }
    else
    if(data.event==CABLES.PACO_OP_DELETE)
    {
        console.log("op delete");
        this._patch.deleteOp(data.vars.op,true);
    }
    else
    if(data.event==CABLES.PACO_OP_ENABLE)
    {
        var op=this._patch.getOpById(data.vars.op);
        if(op)op.enabled=true;
    }
    else
    if(data.event==CABLES.PACO_OP_DISABLE)
    {
        var op=this._patch.getOpById(data.vars.op);
        if(op)op.enabled=false;
    }
    else
    if(data.event==CABLES.PACO_UNLINK)
    {
        var op1=this._patch.getOpById(data.vars.op1);
        var op2=this._patch.getOpById(data.vars.op2);
        var port1=op1.getPort(data.vars.port1);
        var port2=op2.getPort(data.vars.port2);
        port1.removeLinkTo(port2);
    }
    else
    if(data.event==CABLES.PACO_LINK)
    {
        var op1=this._patch.getOpById(data.vars.op1);
        var op2=this._patch.getOpById(data.vars.op2);
        this._patch.link(op1,data.vars.port1,op2,data.vars.port2);
    }
    else
    if(data.event==CABLES.PACO_VALUECHANGE)
    {
        var op=this._patch.getOpById(data.vars.op);
        var p=op.getPort(data.vars.port);
        p.set(data.vars.v);
    }
    else
    {
        console.log("unknown patchConnectionEvent!",ev);
    }
};

CABLES.PatchConnectionSender=function(patch,options)
{
    this.connectors=[];
    this.connectors.push(new CABLES.PatchConnectorBroadcastChannel());


};

CABLES.PatchConnectionSender.prototype.send=function(event,vars)
{
    for(var i=0;i<this.connectors.length;i++)
    {
        this.connectors[i].send(event,vars);
    }

};

// -------------

CABLES.PatchConnectorBroadcastChannel=function()
{
    if(!window.BroadcastChannel)return;
    
    this.bc = new BroadcastChannel('test_channel');
};

CABLES.PatchConnectorBroadcastChannel.prototype.receive=function(paco)
{
    if(!this.bc)return;
    console.log('init');
    this.bc.onmessage = paco._receive.bind(paco);
};

CABLES.PatchConnectorBroadcastChannel.prototype.send=function(event,vars)
{
    if(!this.bc)return;
    var data={};
    data.event=event;
    data.vars=vars;
    this.bc.postMessage(JSON.stringify(data));
    // console.log(data);

};

// -------------

CABLES.PatchConnectorSocketIO=function()
{

    this._socket = io("localhost:5712");
    console.log("socket io paco...");
    this._socket.emit('channel', { name: "hund" });

    this._socket.on("connect",function()
    {
        console.log("CONNECTED");
        // connection.set(socket);
        // connected.set(true);
    });

    this._socket.on("reconnect_error",function()
    {
        console.log("reconnect_error");
        // connected.set(false);
    });

    this._socket.on("connect_error",function()
    {
        console.log("connect_error");
        // connected.set(false);
    });

    this._socket.on("error",function()
    {
        console.log("socket error");
        // connected.set(false);
    });


};

CABLES.PatchConnectorSocketIO.prototype.receive=function(paco)
{
    this._socket.on("event",function( r )
    {
            console.log('socket io receive',r);
            paco._receive(r.data);

    });
};

CABLES.PatchConnectorSocketIO.prototype.send=function(event,vars)
{
    console.log('send socketio');
    var data={};
    data.event=event;
    data.vars=vars;

    this._socket.emit("event",
        {
            "msg":"paco event",
            "event":event,
            "data":data
        });

};

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

CABLES.PatchConnectionReceiver=function(patch,options)
{
    this._patch=patch;
    var bc = new BroadcastChannel('test_channel');
    bc.onmessage = this._receive.bind(this);//function (ev) { console.log(ev); }
}

CABLES.PatchConnectionReceiver.prototype._receive=function(ev)
{
    var data=JSON.parse(ev.data);

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
}

CABLES.PatchConnectionSender=function(patch,options)
{
    this.bc = new BroadcastChannel('test_channel');
}

CABLES.PatchConnectionSender.prototype.send=function(event,vars)
{
    var data={};
    data.event=event;
    data.vars=vars;
    this.bc.postMessage(JSON.stringify(data));
}

op.name="SendPatchChanges";

var connection=op.inObject("Connection");

var start=op.inTriggerButton("Start");

var reloadOnSave=op.inValueBool("Reload listeners on Save");




var conn=null;

connection.onChange=function()
{
    conn=connection.get();
    if(!conn)return;
    
    conn.on("CBL_PORT_CHANGE",function(r)
    {
        outMsg.set(r);
    });
};


if(window.gui)
{
    
window.gui.onSaveProject=function()
{
    if(conn && reloadOnSave.get())
    conn.emit("event",
        {
            "msg":"CABLES_RELOAD_CLIENTS"
        });

};
    
}


start.onTriggered=function()
{
    CABLES.sendingPatchChanges=true;
    var ops=op.patch.ops;
    
    for(var i=0;i<ops.length;i++)
    {
        for(var ip=0;ip<ops[i].portsIn.length;ip++)
        {
            if(!ops[i].portsIn[ip].isLinked() && ops[i].portsIn[ip].type==CABLES.OP_PORT_TYPE_VALUE)
            {
                ops[i].portsIn[ip].chOldOnChange=ops[i].portsIn[ip].onChange;
                ops[i].portsIn[ip].chOldOnValueChanged=ops[i].portsIn[ip].onValueChanged;
            
                ops[i].portsIn[ip].onChange=function()
                {
                    // console.log(this.name,this.value,this.parent.id,this.parent.objName);
                
                    conn.emit("event",
                        {
                            "msg":"CABLES_PORT_VALUE_CHANGE",
                            "op":this.parent.id,
                            "name":this.name,
                            "value":this.value,
                        });
    
                    
                    if(this.chOldOnChange)this.chOldOnChange();
                    if(this.onValueChanged)this.onValueChanged();
                }.bind( ops[i].portsIn[ip] );
            }
        }

    }
};


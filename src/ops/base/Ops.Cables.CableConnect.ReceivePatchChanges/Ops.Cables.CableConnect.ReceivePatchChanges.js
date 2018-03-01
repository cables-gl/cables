// var theOp=op.patch.getOpById("05a1af10-c454-46e9-bc9c-e5cae6f5a8ee");
// theOp.getPort("r").set(1);

var connection=op.inObject("Connection");

connection.onChange=function()
{
    var conn=connection.get();
    if(!conn)return;
    
    console.log("listening to changes...");


    conn.on("event",function( r )
    {
        
        if(CABLES.sendingPatchChanges)return;
        if(r.msg=="CABLES_PORT_VALUE_CHANGE")
        {
            console.log("CABLES_PORT_VALUE_CHANGE");

            var theOp=op.patch.getOpById(r.op);
            theOp.getPort(r.name).set(r.value);
        }
        else
        if(r.msg=="CABLES_RELOAD_CLIENTS")
        {
            if(CABLES.UI)return;
            document.location.reload();
            
        }


    });
};


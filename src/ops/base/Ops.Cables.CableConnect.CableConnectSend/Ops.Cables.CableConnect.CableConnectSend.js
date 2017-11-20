op.name="CableConnectSend";

var connection=op.inObject("Connection");

var msg=op.inValueString("Message");
var trigger=op.inFunctionButton("Trigger");

connection.onChange=function()
{
    var conn=connection.get();
    if(!conn)return;
};

trigger.onTriggered=function()
{
    var conn=connection.get();
    if(!conn)return;

    conn.emit("event",
        {
            "msg":msg.get()
        });
};
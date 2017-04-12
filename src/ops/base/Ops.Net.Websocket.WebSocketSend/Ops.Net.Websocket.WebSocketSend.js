op.name="WebSocketSend";

var inConnection=op.inObject("Connection");
var inObject=op.inObject("Object");
var inSend=op.inFunctionButton("Send");
var connection=null;

inConnection.onChange=function()
{
    connection=inConnection.get();
};

inSend.onTriggered=function()
{
    if(connection && inObject.get())
    {
        
        connection.send(JSON.stringify(inObject.get()));

    }
    else
    {
        // console.log("no connection");
    }
};

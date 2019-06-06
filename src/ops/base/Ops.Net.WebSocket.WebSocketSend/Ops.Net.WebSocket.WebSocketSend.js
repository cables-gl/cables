const
    inConnection=op.inObject("Connection"),
    inObject=op.inObject("Object"),
    inSend=op.inTriggerButton("Send"),
    outSent=op.outValueBool("Sent");
var connection=null;

inConnection.onChange=function()
{
    connection=inConnection.get();
};

inSend.onTriggered=function()
{

    // if(!connection)console.log("no conenction");
    // if(!inObject.get())console.log("no object");
    if(connection && inObject.get())
    {

        // connection.send(JSON.stringify(inObject.get()));

// console.log(inObject.get());
        connection.send(JSON.stringify(inObject.get()));
        outSent.set(true);
    }
    else
    {
        outSent.set(false);
        // console.log("no connection");
    }
};

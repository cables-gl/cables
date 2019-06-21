const
    inConnection=op.inObject("Connection"),
    inObject=op.inObject("Object"),
    inSend=op.inTriggerButton("Send"),
    inStringify=op.inBool("Send String",true),
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


        if(inStringify.get())connection.send(JSON.stringify(inObject.get()));
            else connection.send(inObject.get());

        outSent.set(true);
    }
    else
    {
        outSent.set(false);
        // console.log("no connection");
    }
};

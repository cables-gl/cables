op.name='Websocket';

var inUrl=this.addInPort(new Port(this,"url",OP_PORT_TYPE_VALUE,{type:'string'}));


var inSend=op.inFunctionButton("Send");
var inText=op.inValue("Send String");

var outResult=this.addOutPort(new Port(this,"result", OP_PORT_TYPE_OBJECT));
var outConnected=this.addOutPort(new Port(this,"connected"));

var connection=null;
var timeout=null;
var connectedTo='';

inUrl.onValueChanged=connect;
timeout=setTimeout(checkConnection,1000);

inUrl.set();

function checkConnection()
{
    if(outConnected.get===false) connect();

    timeout=setTimeout(checkConnection,1000);
}

inSend.onTriggered=function()
{
    connection.send('{"HURZ":123}');

    
};

function connect()
{
    if(outConnected.get()===true && connectedTo==inUrl.get()) return;
    // if(outConnected.get()===true)connection.close();

    if(!inUrl.get() || inUrl.get()==='') 
    {
        console.log("websocket: invalid url ");
        outConnected.set(false);
        return;
    }

    window.WebSocket = window.WebSocket || window.MozWebSocket;
 
    if (!window.WebSocket)
        console.error('Sorry, but your browser doesn\'t support WebSockets.');

    try
    {
        if(connection!==null)connection.close();
        connection = new WebSocket(inUrl.get());
    }
    catch (e)
    {
        console.log('could not connect to',inUrl.get());
    }

    connection.onerror = function (message)
    {
        outConnected.set(false);
    };

    connection.onclose = function (message)
    {
        outConnected.set(false);
    };

    connection.onopen = function (message)
    {
        outConnected.set(true);
        connectedTo=inUrl.get();
    };

    connection.onmessage = function (message)
    {
        try
        {
            var json = JSON.parse(message.data);
            outResult.set(json);
        }
        catch(e)
        {
            console.log(e);
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
    };

}


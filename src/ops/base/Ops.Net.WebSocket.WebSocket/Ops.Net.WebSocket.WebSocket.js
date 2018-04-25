// ws://192.168.1.235

var inUrl=op.inValueString("url");

var outResult=op.outObject("result");
var outConnected=op.outValue("connected");
var outConnection=this.outObject("Connection");

var outReceived=op.outFunction("Received Data");

var connection=null;
var timeout=null;
var connectedTo='';

inUrl.onValueChanged=connect;
timeout=setTimeout(checkConnection,2000);

inUrl.set();

var connecting=false;


function checkConnection()
{
    if(outConnected.get()===false && !connecting)
    {
        console.log("reconnect websocket...");
        connect();
    }

    timeout=setTimeout(checkConnection,2000);
}

op.onDelete=function()
{
    if(outConnected.get()===true)connection.close();
    connecting=false;
    clearTimeout(timeout);
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
        connecting=true;
        if(connection!==null)connection.close();
        connection = new WebSocket(inUrl.get());
    }
    catch (e)
    {
        console.log('could not connect to',inUrl.get());
        connecting=false;
    }

    if(connection)
    {
        connection.onerror = function (message)
        {
            connecting=false;
            console.log("ws error");
            outConnected.set(false);
            outConnection.set(null);
        };
    
        connection.onclose = function (message)
        {
            connecting=false;
            console.log("ws close");
            outConnected.set(false);
            outConnection.set(null);
        };
    
        connection.onopen = function (message)
        {
            connecting=false;
            outConnected.set(true);
            connectedTo=inUrl.get();
            outConnection.set(connection);
        };
    
        connection.onmessage = function (message)
        {
            try
            {
                var json = JSON.parse(message.data);
                outResult.set(null);
                outResult.set(json);
                outReceived.trigger();
    
            }
            catch(e)
            {
                console.log(e);
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }
        };
        
    }

}


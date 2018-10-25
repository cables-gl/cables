var self=this;
//Op.apply(this, arguments);

this.name='Websocket';
this.url=this.addInPort(new CABLES.Port(this,"url",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
this.result=this.addOutPort(new CABLES.Port(this,"result", OP_PORT_TYPE_OBJECT));
this.connected=this.addOutPort(new CABLES.Port(this,"connected"));

var outSocket=op.outObject("Socket");


var connection=null;
var timeout=null;
var connectedTo='';

function checkConnection()
{
    if(self.connected.val===false)
    {
        connect();
    }
    timeout=setTimeout(checkConnection,1000);
}

function connect()
{
    if(self.connected.val===true && connectedTo==self.url.val) return;
    if(self.connected.val===true)connection.close();

    window.WebSocket = window.WebSocket || window.MozWebSocket;
 
     if (!window.WebSocket)
        console.error('Sorry, but your browser doesn\'t support WebSockets.');

    try
    {
        if(connection!=null)connection.close();
        connection = new WebSocket(self.url.val);
    }catch (e)
    {
        console.log('could not connect to',self.url.val);
    }
    
    connection.onerror = function (message)
    {
        self.connected.val=false;
        outSocket.set(null);
    };

    connection.onclose = function (message)
    {
        self.connected.val=false;
        outSocket.set(null);
    };

    connection.onopen = function (message)
    {
        self.connected.val=true;
        connectedTo=self.url.val;
        outSocket.set(connection);
    };

    connection.onmessage = function (message)
    {
        try
        {
            var json = JSON.parse(message.data);
            self.result.val=json;
                    
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
    };

    
    
}

this.url.onValueChanged=connect;
timeout=setTimeout(checkConnection,1000);

this.url.val='ws://127.0.0.1:1337';
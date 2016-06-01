var self=this;
Op.apply(this, arguments);

this.name='laser socket';
this.url=this.addInPort(new Port(this,"url",OP_PORT_TYPE_VALUE,{type:'string'}));
this.result=this.addOutPort(new Port(this,"result", OP_PORT_TYPE_OBJECT));
var outConnected=this.addOutPort(new Port(this,"connected"));
outConnected.set(false);

var connected=false;

var laserArray=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var connection=null;
var timeout=null;
var connectedTo='';

exe.onTriggered=function()
{
    if(connected)
    {
        connection.send(laserArray.get()); 
    }
};


function checkConnection()
{

// 0 - connection not yet established
// 1 - conncetion established
// 2 - in closing handshake
// 3 - connection closed or could not open

// connection.readyState


    if(!connection || connection.readyState!=1)
    {
        console.log('retry');
        connected=false;
        connect();
    }
    else
    {
        connected=true;
    }
    timeout=setTimeout(checkConnection,1000);
}


function reconnect()
{

    try
    {
        if(connection!=null)
        {
            console.log('i close the connection...');
            connection.close();
        }
        connection = new WebSocket(self.url.val);
    }
    catch (e)
    {
        console.log('could not connect to',self.url.val);
    }

}
function connect()
{
    if(connected===true && connectedTo==self.url.val) return;
    if(connected===true)
    {
        // console.log('closing connection...');
        // connection.close();
    }

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    
    if(!connection)
    {
        reconnect();
        return;
    }
 
     if (!window.WebSocket) console.error('Sorry, but your browser doesn\'t support WebSockets.');
    
    connection.onerror = function (message)
    {
        console.log("ws error");
        connected=false;
        outConnected.set(false);
    };

    connection.onclose = function (message)
    {
        console.log("ws close");
        connected=false;
        outConnected.set(false);
    };

    connection.onopen = function (message)
    {
        console.log("ws connected !!!!");
        connected=true;
        connectedTo=self.url.val;
        outConnected.set(true);
    };

    connection.onmessage = function (message)
    {
        try
        {
            var json = JSON.parse(message.data);
            self.result.val=json;
            console.log('message',json);
        }
        catch(e)
        {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
    };

    
    
}

this.url.onValueChanged=reconnect;
timeout=setTimeout(checkConnection,1000);

this.url.val='ws://192.168.1.174:8080/laz0r';
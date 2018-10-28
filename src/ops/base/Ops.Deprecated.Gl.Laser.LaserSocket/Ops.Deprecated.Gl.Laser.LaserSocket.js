var self=this;
//Op.apply(this, arguments);

this.name='laser socket';
this.url=this.addInPort(new CABLES.Port(this,"url",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));

var speed=this.addInPort(new CABLES.Port(this,"speed",CABLES.OP_PORT_TYPE_VALUE));
speed.set(5000);
this.result=this.addOutPort(new CABLES.Port(this,"result",CABLES.OP_PORT_TYPE_OBJECT));
var outConnected=this.addOutPort(new CABLES.Port(this,"connected"));
outConnected.set(false);

var connected=false;

var laserArray=this.addInPort(new CABLES.Port(this,"array",CABLES.OP_PORT_TYPE_ARRAY));
var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var connection=null;
var timeout=null;
var connectedTo='';
var arr=[];
exe.onTriggered=function()
{
    var theArr=laserArray.get();
    if(connected && theArr && theArr.length>0)
    {
        
        // console.log('theArr.length',theArr.length);
        arr.length=theArr.length+1;
        arr[0]=speed.get();
        for(var i=0;i<theArr.length;i++)
        {
            arr[i+1]=theArr[i];
        }
        connection.send(arr);
        // console.log(theArr);
        // console.log('array ',arr);
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
        connection=null;
        connect();
    }
    else
    {
        connected=true;
    }
    timeout=setTimeout(checkConnection,5000);
}


function reconnect()
{

    try
    {
        if(connection!=null)
        {
            console.log('closing the connection...');
            connection.close();
        }
        console.log('connecting to ',self.url.get());
        connection = new WebSocket(self.url.get());
    }
    catch (e)
    {
        console.log('could not connect to',self.url.get());
    }

}
function connect()
{
    if(connected===true && connectedTo==self.url.get()) return;

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    
    if(!connection)
    {
        reconnect();
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

this.url.val='ws://192.168.1.174:9000/';
this.url.onValueChanged=reconnect;
timeout=setTimeout(checkConnection,1000);


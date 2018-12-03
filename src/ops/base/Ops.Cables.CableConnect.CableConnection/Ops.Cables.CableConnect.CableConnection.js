var inUrl=op.inValueString("URL","http://192.168.4.92:5712");
var channel=op.inValueString("Channel",CABLES.generateUUID());
var connection=op.outObject("Connection");
var connected=op.outValue("Connected",false);

var socket=null;

channel.onChange=function()
{
    socket = io(inUrl.get());
    console.log("joining cableconenct channel...");
    socket.emit('channel', { name: channel.get() });
    
    socket.on("connect",function()
        {
            
            connection.set(socket);
            connected.set(true);
        });

    socket.on("reconnect_error",function()
    {
        // console.log("reconnect_error");
        connected.set(false);
    });

    socket.on("connect_error",function()
    {
        // console.log("connect_error");
        connected.set(false);
    });

    socket.on("error",function()
    {
        // console.log("socket error");
        connected.set(false);
    });
};


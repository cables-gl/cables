const inUrl = op.inValueString("URL", "http://192.168.4.92:5712");
const channel = op.inValueString("Channel", CABLES.generateUUID());
const connection = op.outObject("Connection");
const connected = op.outValue("Connected", false);

let socket = null;

channel.onChange = function ()
{
    socket = io(inUrl.get());
    op.log("joining cableconenct channel...");
    socket.emit("channel", { "name": channel.get() });

    socket.on("connect", function ()
    {
        connection.set(socket);
        connected.set(true);
    });

    socket.on("reconnect_error", function ()
    {
        // op.log("reconnect_error");
        connected.set(false);
    });

    socket.on("connect_error", function ()
    {
        // op.log("connect_error");
        connected.set(false);
    });

    socket.on("error", function ()
    {
        // op.log("socket error");
        connected.set(false);
    });
};

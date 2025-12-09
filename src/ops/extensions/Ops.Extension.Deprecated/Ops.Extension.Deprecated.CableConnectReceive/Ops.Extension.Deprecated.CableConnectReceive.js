let connection = op.inObject("Connection");

let outMsg = op.outValue("Message");

connection.onChange = function ()
{
    let conn = connection.get();
    if (!conn) return;

    conn.on("event", function (r)
    {
        outMsg.set(r);
    });
};

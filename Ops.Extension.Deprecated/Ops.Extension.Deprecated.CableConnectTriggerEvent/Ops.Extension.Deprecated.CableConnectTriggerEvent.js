const connection = op.inObject("Connection");
const evnt = op.inValueString("Event");

const next = op.outTrigger("Trigger");

connection.onChange = function ()
{
    const conn = connection.get();
    if (!conn) return;

    conn.on("event", function (r)
    {
        op.log(r);
        if (r == evnt.get()) next.trigger();
    });
};

let connection = op.inObject("Connection");

let msg = op.inValueString("Message");
let trigger = op.inTriggerButton("Trigger");

connection.onChange = function ()
{
    let conn = connection.get();
    if (!conn) return;
};

trigger.onTriggered = function ()
{
    let conn = connection.get();
    if (!conn) return;

    conn.emit("event",
        {
            "msg": msg.get()
        });
};

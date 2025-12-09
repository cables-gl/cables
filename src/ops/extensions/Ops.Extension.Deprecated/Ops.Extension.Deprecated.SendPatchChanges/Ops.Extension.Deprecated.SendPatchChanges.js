let connection = op.inObject("Connection");
let start = op.inTriggerButton("Start");
let reloadOnSave = op.inValueBool("Reload listeners on Save");

let conn = null;

connection.onChange = function ()
{
    conn = connection.get();
    if (!conn) return;

    conn.on("CBL_PORT_CHANGE", function (r)
    {
        outMsg.set(r);
    });
};

if (window.gui)
{
    window.gui.onSaveProject = function ()
    {
        if (conn && reloadOnSave.get())
            conn.emit("event",
                {
                    "msg": "CABLES_RELOAD_CLIENTS"
                });
    };
}

start.onTriggered = function ()
{
    CABLES.sendingPatchChanges = true;
    let ops = op.patch.ops;

    for (let i = 0; i < ops.length; i++)
    {
        for (let ip = 0; ip < ops[i].portsIn.length; ip++)
        {
            if (!ops[i].portsIn[ip].isLinked() && ops[i].portsIn[ip].type == CABLES.OP_PORT_TYPE_VALUE)
            {
                ops[i].portsIn[ip].chOldOnChange = ops[i].portsIn[ip].onChange;
                ops[i].portsIn[ip].chOldOnValueChanged = ops[i].portsIn[ip].onValueChanged;

                ops[i].portsIn[ip].onChange = function ()
                {
                    conn.emit("event",
                        {
                            "msg": "CABLES_PORT_VALUE_CHANGE",
                            "op": this.parent.id,
                            "name": this.name,
                            "value": this.value,
                        });

                    if (this.chOldOnChange) this.chOldOnChange();
                    if (this.onValueChanged) this.onValueChanged();
                }.bind(ops[i].portsIn[ip]);
            }
        }
    }
};

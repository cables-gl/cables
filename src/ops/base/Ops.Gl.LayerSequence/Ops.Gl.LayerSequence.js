const
    exe = op.inTrigger("exe"),
    cleanup = op.inTriggerButton("Clean up connections");

const
    cgl = op.patch.cgl,
    triggers = [],
    num = 16;

let updateTimeout = null;

exe.onTriggered = triggerAll;
cleanup.onTriggered = clean;
cleanup.setUiAttribs({ "hidePort": true });
cleanup.setUiAttribs({ "hideParam": true });

for (let i = 0; i < num; i++)
{
    const p = op.outTrigger("trigger " + i);
    triggers.push(p);
    p.onLinkChanged = updateButton;
}

function updateButton()
{
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() =>
    {
        let show = false;
        for (let i = 0; i < triggers.length; i++)
            if (triggers[i].links.length > 1) show = true;

        cleanup.setUiAttribs({ "hideParam": !show });

        if (op.isCurrentUiOp()) op.refreshParams();
    }, 60);
}

function triggerAll()
{
    for (let i = 0; i < triggers.length; i++)
    {
        if (triggers[i].isLinked())
        {
            cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

            triggers[i].trigger();
        }
    }
}

function clean()
{
    let count = 0;
    for (let i = 0; i < triggers.length; i++)
    {
        let removeLinks = [];

        if (triggers[i].links.length > 1)
            for (let j = 1; j < triggers[i].links.length; j++)
            {
                while (triggers[count].links.length > 0) count++;

                removeLinks.push(triggers[i].links[j]);
                const otherPort = triggers[i].links[j].getOtherPort(triggers[i]);
                op.patch.link(op, "trigger " + count, otherPort.op, otherPort.name);
                count++;
            }

        for (let j = 0; j < removeLinks.length; j++) removeLinks[j].remove();
    }
    updateButton();
}

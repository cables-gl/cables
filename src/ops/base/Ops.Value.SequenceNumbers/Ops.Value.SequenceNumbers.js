const cleanup = op.inTriggerButton("Clean up connections");
cleanup.onTriggered = clean;
cleanup.setUiAttribs({ "hidePort": true });
cleanup.setUiAttribs({ "hideParam": true });
let updateTimeout = null;

const outputs = [];
const inputs = [];

for (let i = 0; i < 16; i++)
{
    const inp = op.inFloat("Number " + i, 0);
    const out = op.outNumber("Output " + i);

    inp.changeAlways = true;
    out.onLinkChanged = updateButton;

    outputs.push(out);
    inputs.push(inp);
}

for (let i = 0; i < inputs.length; i++)
{
    const inp = inputs[i];
    inp.onChange = function ()
    {
        for (let j = 0; j < outputs.length; j++) outputs[j].set(inp.get());
    };
}

function updateButton()
{
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() =>
    {
        let show = false;
        for (let i = 0; i < outputs.length; i++)
            if (outputs[i].links.length > 1) show = true;

        cleanup.setUiAttribs({ "hideParam": !show });

        if (op.isCurrentUiOp()) op.refreshParams();
    }, 60);
}

function clean()
{
    let count = 0;
    for (let i = 0; i < outputs.length; i++)
    {
        let removeLinks = [];

        if (outputs[i].links.length > 1)
            for (let j = 1; j < outputs[i].links.length; j++)
            {
                while (outputs[count].links.length > 0) count++;

                removeLinks.push(outputs[i].links[j]);
                const otherPort = outputs[i].links[j].getOtherPort(outputs[i]);
                op.patch.link(op, "Output " + count, otherPort.op, otherPort.name);
                count++;
            }

        for (let j = 0; j < removeLinks.length; j++) removeLinks[j].remove();
    }
    updateButton();
}

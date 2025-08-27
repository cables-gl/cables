const inUpd = op.inTriggerButton("Update");
const outScrollX = op.outNumber("Scoll X");
const outScrollY = op.outNumber("Scoll Y");

inUpd.onTriggered = update;

function update()
{
    outScrollX.set(window.scrollX);
    outScrollY.set(window.scrollY);
}

const exec = op.inTrigger("Exec");
const outArr = op.outObject("Result");

exec.onTriggered = () =>
{
    outArr.setRef(CABLES.eventTargetProfile);
};

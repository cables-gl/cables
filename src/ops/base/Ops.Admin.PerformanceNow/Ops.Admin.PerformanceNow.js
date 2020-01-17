

const
    inUpdate=op.inTrigger("update"),
    res=op.outNumber("Result");

inUpdate.onTriggered=function()
{
  res.set(performance.now());
};
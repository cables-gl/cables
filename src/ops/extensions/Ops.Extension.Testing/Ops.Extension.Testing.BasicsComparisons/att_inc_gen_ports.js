const port_2ec0yqfgh=op.inTrigger("2ec0yqfgh");
port_2ec0yqfgh.setUiAttribs({title:"Trigger_10",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_2ec0yqfgh = addedOps[i].outTrigger("innerOut_2ec0yqfgh");
innerOut_2ec0yqfgh.setUiAttribs({title:"Trigger_10"});
port_2ec0yqfgh.onTriggered = () => { innerOut_2ec0yqfgh.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

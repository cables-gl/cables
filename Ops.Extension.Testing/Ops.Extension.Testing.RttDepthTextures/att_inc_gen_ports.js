const port_scd98fe9x=op.inTrigger("scd98fe9x");
port_scd98fe9x.setUiAttribs({title:"add port",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_scd98fe9x = addedOps[i].outTrigger("innerOut_scd98fe9x");
innerOut_scd98fe9x.setUiAttribs({title:"add port"});
port_scd98fe9x.onTriggered = () => { innerOut_scd98fe9x.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

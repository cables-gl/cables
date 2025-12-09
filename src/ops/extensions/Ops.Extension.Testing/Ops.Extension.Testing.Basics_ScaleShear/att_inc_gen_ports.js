const port_cke3ipv4p=op.inTrigger("cke3ipv4p");
port_cke3ipv4p.setUiAttribs({title:"Trigger_3",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_cke3ipv4p = addedOps[i].outTrigger("innerOut_cke3ipv4p");
innerOut_cke3ipv4p.setUiAttribs({title:"Trigger_3"});
port_cke3ipv4p.onTriggered = () => { innerOut_cke3ipv4p.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

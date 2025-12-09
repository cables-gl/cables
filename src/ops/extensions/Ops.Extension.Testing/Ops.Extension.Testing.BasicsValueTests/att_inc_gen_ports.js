const port_pxcjhgfwh=op.inTrigger("pxcjhgfwh");
port_pxcjhgfwh.setUiAttribs({title:"Trigger_9",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_pxcjhgfwh = addedOps[i].outTrigger("innerOut_pxcjhgfwh");
innerOut_pxcjhgfwh.setUiAttribs({title:"Trigger_9"});
port_pxcjhgfwh.onTriggered = () => { innerOut_pxcjhgfwh.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

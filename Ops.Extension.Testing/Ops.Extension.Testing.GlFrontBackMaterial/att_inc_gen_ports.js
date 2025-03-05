const port_d2yd0ra4y=op.inTrigger("d2yd0ra4y");
port_d2yd0ra4y.setUiAttribs({title:"render",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_d2yd0ra4y = addedOps[i].outTrigger("innerOut_d2yd0ra4y");
innerOut_d2yd0ra4y.setUiAttribs({title:"render"});
port_d2yd0ra4y.onTriggered = () => { innerOut_d2yd0ra4y.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

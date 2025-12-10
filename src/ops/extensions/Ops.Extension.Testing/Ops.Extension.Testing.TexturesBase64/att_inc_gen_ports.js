const port_7k4q2yw01=op.inTrigger("7k4q2yw01");
port_7k4q2yw01.setUiAttribs({title:"add port",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_7k4q2yw01 = addedOps[i].outTrigger("innerOut_7k4q2yw01");
innerOut_7k4q2yw01.setUiAttribs({title:"add port"});
port_7k4q2yw01.onTriggered = () => { innerOut_7k4q2yw01.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

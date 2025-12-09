const port_jbbxi2uxh=op.inTrigger("jbbxi2uxh");
port_jbbxi2uxh.setUiAttribs({title:"render",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_jbbxi2uxh = addedOps[i].outTrigger("innerOut_jbbxi2uxh");
innerOut_jbbxi2uxh.setUiAttribs({title:"render"});
port_jbbxi2uxh.onTriggered = () => { innerOut_jbbxi2uxh.trigger(); };

    }
if(addedOps[i].innerOutput)
{
}
}
};

const port_jbbxi2uxh=op.inTrigger("jbbxi2uxh");
port_jbbxi2uxh.setUiAttribs({title:"render",});

const port_pfzicf9a4=op.outString("pfzicf9a4");
port_pfzicf9a4.setUiAttribs({title:"Frozen String",});

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
const innerIn_pfzicf9a4 = addedOps[i].inString("innerIn_pfzicf9a4");
innerIn_pfzicf9a4.setUiAttribs({title:"Frozen String"});
innerIn_pfzicf9a4.on("change", (a,v) => { port_pfzicf9a4.set(a); });

}
}
};

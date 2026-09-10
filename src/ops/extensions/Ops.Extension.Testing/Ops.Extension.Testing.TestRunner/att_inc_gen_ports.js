const port_tq8u4oq9c=op.inString("tq8u4oq9c","");
port_tq8u4oq9c.setUiAttribs({title:"prefix",});
port_tq8u4oq9c.setUiAttribs({"values":[""]});

const port_36nbm6qlt=op.outTrigger("36nbm6qlt");
port_36nbm6qlt.setUiAttribs({title:"trigger",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_tq8u4oq9c = addedOps[i].outString("innerOut_tq8u4oq9c");
innerOut_tq8u4oq9c.set(port_tq8u4oq9c.get() );
innerOut_tq8u4oq9c.setUiAttribs({title:"prefix"});
port_tq8u4oq9c.on("change", (a,v) => { innerOut_tq8u4oq9c.set(a); });

    }
if(addedOps[i].innerOutput)
{
const innerIn_36nbm6qlt = addedOps[i].inTrigger("innerIn_36nbm6qlt");
innerIn_36nbm6qlt.setUiAttribs({title:"trigger"});
innerIn_36nbm6qlt.onTriggered = () => { port_36nbm6qlt.trigger(); };

}
}
};

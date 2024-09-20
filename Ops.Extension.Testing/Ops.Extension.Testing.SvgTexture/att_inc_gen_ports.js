const port_m57hn1hvy=op.inTrigger("m57hn1hvy");
port_m57hn1hvy.setUiAttribs({title:"render",});

const port_q7rod63s1=op.inString("q7rod63s1","/assets/664711fbbb71706c00625ead/cables.svg");
port_q7rod63s1.setUiAttribs({title:"File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_m57hn1hvy = addedOps[i].outTrigger("innerOut_m57hn1hvy");
innerOut_m57hn1hvy.setUiAttribs({title:"render"});
port_m57hn1hvy.onTriggered = () => { innerOut_m57hn1hvy.trigger(); };

const innerOut_q7rod63s1 = addedOps[i].outString("innerOut_q7rod63s1");
innerOut_q7rod63s1.set(port_q7rod63s1.get() );
innerOut_q7rod63s1.setUiAttribs({title:"File"});
port_q7rod63s1.on("change", (a,v) => { innerOut_q7rod63s1.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

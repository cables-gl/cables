const port_nwshu8bql=op.inTrigger("nwshu8bql");
port_nwshu8bql.setUiAttribs({title:"exe 4",});

const port_317uc3lxl=op.inString("317uc3lxl","/assets/664711fbbb71706c00625ead/lottie.json");
port_317uc3lxl.setUiAttribs({title:"URL",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_nwshu8bql = addedOps[i].outTrigger("innerOut_nwshu8bql");
innerOut_nwshu8bql.setUiAttribs({title:"exe 4"});
port_nwshu8bql.onTriggered = () => { innerOut_nwshu8bql.trigger(); };

const innerOut_317uc3lxl = addedOps[i].outString("innerOut_317uc3lxl");
innerOut_317uc3lxl.set(port_317uc3lxl.get() );
innerOut_317uc3lxl.setUiAttribs({title:"URL"});
port_317uc3lxl.on("change", (a,v) => { innerOut_317uc3lxl.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

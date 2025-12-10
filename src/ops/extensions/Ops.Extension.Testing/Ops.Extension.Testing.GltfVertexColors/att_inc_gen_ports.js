const port_94uzkbsko=op.inTrigger("94uzkbsko");
port_94uzkbsko.setUiAttribs({title:"render",});

const port_jgob8i89i=op.inString("jgob8i89i","/assets/619e244ce4dff21e0ce04166/vertexpaint_cube.glb");
port_jgob8i89i.setUiAttribs({title:"glb File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_94uzkbsko = addedOps[i].outTrigger("innerOut_94uzkbsko");
innerOut_94uzkbsko.setUiAttribs({title:"render"});
port_94uzkbsko.onTriggered = () => { innerOut_94uzkbsko.trigger(); };

const innerOut_jgob8i89i = addedOps[i].outString("innerOut_jgob8i89i");
innerOut_jgob8i89i.set(port_jgob8i89i.get() );
innerOut_jgob8i89i.setUiAttribs({title:"glb File"});
port_jgob8i89i.on("change", (a,v) => { innerOut_jgob8i89i.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

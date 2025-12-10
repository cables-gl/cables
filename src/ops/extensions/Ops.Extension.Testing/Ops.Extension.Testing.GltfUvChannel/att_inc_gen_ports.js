const port_3ag0l5i42=op.inTrigger("3ag0l5i42");
port_3ag0l5i42.setUiAttribs({title:"exe 0",});

const port_kum9etdeb=op.inString("kum9etdeb","/assets/615acb0995a0966eb0937a6f/head-multi_UV.glb");
port_kum9etdeb.setUiAttribs({title:"glb File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_3ag0l5i42 = addedOps[i].outTrigger("innerOut_3ag0l5i42");
innerOut_3ag0l5i42.setUiAttribs({title:"exe 0"});
port_3ag0l5i42.onTriggered = () => { innerOut_3ag0l5i42.trigger(); };

const innerOut_kum9etdeb = addedOps[i].outString("innerOut_kum9etdeb");
innerOut_kum9etdeb.set(port_kum9etdeb.get() );
innerOut_kum9etdeb.setUiAttribs({title:"glb File"});
port_kum9etdeb.on("change", (a,v) => { innerOut_kum9etdeb.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

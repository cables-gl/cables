const port_fwagmglix=op.inTrigger("fwagmglix");
port_fwagmglix.setUiAttribs({title:"render",});

const port_zmd1pqgqt=op.inString("zmd1pqgqt","/assets/67bed8fd280089832fce1e2e/pointanim.glb");
port_zmd1pqgqt.setUiAttribs({title:"glb File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_fwagmglix = addedOps[i].outTrigger("innerOut_fwagmglix");
innerOut_fwagmglix.setUiAttribs({title:"render"});
port_fwagmglix.onTriggered = () => { innerOut_fwagmglix.trigger(); };

const innerOut_zmd1pqgqt = addedOps[i].outString("innerOut_zmd1pqgqt");
innerOut_zmd1pqgqt.set(port_zmd1pqgqt.get() );
innerOut_zmd1pqgqt.setUiAttribs({title:"glb File"});
port_zmd1pqgqt.on("change", (a,v) => { innerOut_zmd1pqgqt.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

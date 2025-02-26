const port_94uzkbsko=op.inTrigger("94uzkbsko");
port_94uzkbsko.setUiAttribs({title:"render",});

const port_150lmjbe5=op.inString("150lmjbe5","/assets/664711fbbb71706c00625ead/vertexpaint_cube.glb");
port_150lmjbe5.setUiAttribs({title:"glb File",display:"file",});

const port_omkvad0bg=op.outString("omkvad0bg");
port_omkvad0bg.setUiAttribs({title:"Frozen String",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_94uzkbsko = addedOps[i].outTrigger("innerOut_94uzkbsko");
innerOut_94uzkbsko.setUiAttribs({title:"render"});
port_94uzkbsko.onTriggered = () => { innerOut_94uzkbsko.trigger(); };

const innerOut_150lmjbe5 = addedOps[i].outString("innerOut_150lmjbe5");
innerOut_150lmjbe5.set(port_150lmjbe5.get() );
innerOut_150lmjbe5.setUiAttribs({title:"glb File"});
port_150lmjbe5.on("change", (a,v) => { innerOut_150lmjbe5.set(a); });

    }
if(addedOps[i].innerOutput)
{
const innerIn_omkvad0bg = addedOps[i].inString("innerIn_omkvad0bg");
innerIn_omkvad0bg.setUiAttribs({title:"Frozen String"});
innerIn_omkvad0bg.on("change", (a,v) => { port_omkvad0bg.set(a); });

}
}
};

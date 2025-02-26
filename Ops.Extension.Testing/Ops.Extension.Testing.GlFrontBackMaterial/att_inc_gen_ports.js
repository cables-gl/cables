const port_d2yd0ra4y=op.inTrigger("d2yd0ra4y");
port_d2yd0ra4y.setUiAttribs({title:"render",});

const port_j4na3hfde=op.outString("j4na3hfde");
port_j4na3hfde.setUiAttribs({title:"Frozen String",});

const port_x5xqdk8ov=op.outString("x5xqdk8ov");
port_x5xqdk8ov.setUiAttribs({title:"Frozen String",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_d2yd0ra4y = addedOps[i].outTrigger("innerOut_d2yd0ra4y");
innerOut_d2yd0ra4y.setUiAttribs({title:"render"});
port_d2yd0ra4y.onTriggered = () => { innerOut_d2yd0ra4y.trigger(); };

    }
if(addedOps[i].innerOutput)
{
const innerIn_j4na3hfde = addedOps[i].inString("innerIn_j4na3hfde");
innerIn_j4na3hfde.setUiAttribs({title:"Frozen String"});
innerIn_j4na3hfde.on("change", (a,v) => { port_j4na3hfde.set(a); });

const innerIn_x5xqdk8ov = addedOps[i].inString("innerIn_x5xqdk8ov");
innerIn_x5xqdk8ov.setUiAttribs({title:"Frozen String"});
innerIn_x5xqdk8ov.on("change", (a,v) => { port_x5xqdk8ov.set(a); });

}
}
};

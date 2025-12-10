const port_o44faoari=op.inTrigger("o44faoari");
port_o44faoari.setUiAttribs({title:"render",});

const port_502whkmy4=op.inString("502whkmy4","/assets/6230d3a5e65df56b95088672/roboto-v29-latin-regular.ttf");
port_502whkmy4.setUiAttribs({title:"Font File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_o44faoari = addedOps[i].outTrigger("innerOut_o44faoari");
innerOut_o44faoari.setUiAttribs({title:"render"});
port_o44faoari.onTriggered = () => { innerOut_o44faoari.trigger(); };

const innerOut_502whkmy4 = addedOps[i].outString("innerOut_502whkmy4");
innerOut_502whkmy4.set(port_502whkmy4.get() );
innerOut_502whkmy4.setUiAttribs({title:"Font File"});
port_502whkmy4.on("change", (a,v) => { innerOut_502whkmy4.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

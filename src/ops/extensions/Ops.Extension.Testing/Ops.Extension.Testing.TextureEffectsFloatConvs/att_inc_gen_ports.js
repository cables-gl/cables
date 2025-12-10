const port_9ruhsdsh9=op.inTrigger("9ruhsdsh9");
port_9ruhsdsh9.setUiAttribs({title:"exe",});

const port_3cusibym6=op.inString("3cusibym6","/assets/67bed8fd280089832fce1e2e/RgbRampsDiagonal.exr");
port_3cusibym6.setUiAttribs({title:"EXR File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_9ruhsdsh9 = addedOps[i].outTrigger("innerOut_9ruhsdsh9");
innerOut_9ruhsdsh9.setUiAttribs({title:"exe"});
port_9ruhsdsh9.onTriggered = () => { innerOut_9ruhsdsh9.trigger(); };

const innerOut_3cusibym6 = addedOps[i].outString("innerOut_3cusibym6");
innerOut_3cusibym6.set(port_3cusibym6.get() );
innerOut_3cusibym6.setUiAttribs({title:"EXR File"});
port_3cusibym6.on("change", (a,v) => { innerOut_3cusibym6.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

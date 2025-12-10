const port_24wczq4w3=op.inTrigger("24wczq4w3");
port_24wczq4w3.setUiAttribs({title:"exe",});

const port_6jxk2lid3=op.inString("6jxk2lid3","/assets/67bed8fd280089832fce1e2e/px__1_.webp");
port_6jxk2lid3.setUiAttribs({title:"posx",display:"file",});

const port_4fcnn9spy=op.inString("4fcnn9spy","/assets/67bed8fd280089832fce1e2e/nx__1_.webp");
port_4fcnn9spy.setUiAttribs({title:"negx",display:"file",});

const port_wv5o1z0mp=op.inString("wv5o1z0mp","/assets/67bed8fd280089832fce1e2e/py__1_.webp");
port_wv5o1z0mp.setUiAttribs({title:"posy",display:"file",});

const port_hpe4kbj74=op.inString("hpe4kbj74","/assets/67bed8fd280089832fce1e2e/ny__1_.webp");
port_hpe4kbj74.setUiAttribs({title:"negy",display:"file",});

const port_ozkx149s6=op.inString("ozkx149s6","/assets/67bed8fd280089832fce1e2e/pz__1_.webp");
port_ozkx149s6.setUiAttribs({title:"posz",display:"file",});

const port_xwfw3og4z=op.inString("xwfw3og4z","/assets/67bed8fd280089832fce1e2e/nz__1_.webp");
port_xwfw3og4z.setUiAttribs({title:"negz",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_24wczq4w3 = addedOps[i].outTrigger("innerOut_24wczq4w3");
innerOut_24wczq4w3.setUiAttribs({title:"exe"});
port_24wczq4w3.onTriggered = () => { innerOut_24wczq4w3.trigger(); };

const innerOut_6jxk2lid3 = addedOps[i].outString("innerOut_6jxk2lid3");
innerOut_6jxk2lid3.set(port_6jxk2lid3.get() );
innerOut_6jxk2lid3.setUiAttribs({title:"posx"});
port_6jxk2lid3.on("change", (a,v) => { innerOut_6jxk2lid3.set(a); });

const innerOut_4fcnn9spy = addedOps[i].outString("innerOut_4fcnn9spy");
innerOut_4fcnn9spy.set(port_4fcnn9spy.get() );
innerOut_4fcnn9spy.setUiAttribs({title:"negx"});
port_4fcnn9spy.on("change", (a,v) => { innerOut_4fcnn9spy.set(a); });

const innerOut_wv5o1z0mp = addedOps[i].outString("innerOut_wv5o1z0mp");
innerOut_wv5o1z0mp.set(port_wv5o1z0mp.get() );
innerOut_wv5o1z0mp.setUiAttribs({title:"posy"});
port_wv5o1z0mp.on("change", (a,v) => { innerOut_wv5o1z0mp.set(a); });

const innerOut_hpe4kbj74 = addedOps[i].outString("innerOut_hpe4kbj74");
innerOut_hpe4kbj74.set(port_hpe4kbj74.get() );
innerOut_hpe4kbj74.setUiAttribs({title:"negy"});
port_hpe4kbj74.on("change", (a,v) => { innerOut_hpe4kbj74.set(a); });

const innerOut_ozkx149s6 = addedOps[i].outString("innerOut_ozkx149s6");
innerOut_ozkx149s6.set(port_ozkx149s6.get() );
innerOut_ozkx149s6.setUiAttribs({title:"posz"});
port_ozkx149s6.on("change", (a,v) => { innerOut_ozkx149s6.set(a); });

const innerOut_xwfw3og4z = addedOps[i].outString("innerOut_xwfw3og4z");
innerOut_xwfw3og4z.set(port_xwfw3og4z.get() );
innerOut_xwfw3og4z.setUiAttribs({title:"negz"});
port_xwfw3og4z.on("change", (a,v) => { innerOut_xwfw3og4z.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

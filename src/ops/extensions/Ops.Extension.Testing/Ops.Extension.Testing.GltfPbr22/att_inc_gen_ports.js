const port_si0ni96ke=op.inTrigger("si0ni96ke");
port_si0ni96ke.setUiAttribs({title:"exe",});

const port_sctq1r681=op.inString("sctq1r681","/assets/654a1089765b6f277db8e991/DamagedHelmet.glb");
port_sctq1r681.setUiAttribs({title:"glb File",display:"file",});

const port_s8gc9utlu=op.inString("s8gc9utlu","/assets/664711fbbb71706c00625ead/helm_albedo.webp");
port_s8gc9utlu.setUiAttribs({title:"File",display:"file",});

const port_1q0owu3w6=op.inString("1q0owu3w6","/assets/664711fbbb71706c00625ead/helm_aorm.webp");
port_1q0owu3w6.setUiAttribs({title:"File",display:"file",});

const port_hs0fvs2ks=op.inString("hs0fvs2ks","/assets/664711fbbb71706c00625ead/helm_normal.webp");
port_hs0fvs2ks.setUiAttribs({title:"File",display:"file",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_si0ni96ke = addedOps[i].outTrigger("innerOut_si0ni96ke");
innerOut_si0ni96ke.setUiAttribs({title:"exe"});
port_si0ni96ke.onTriggered = () => { innerOut_si0ni96ke.trigger(); };

const innerOut_sctq1r681 = addedOps[i].outString("innerOut_sctq1r681");
innerOut_sctq1r681.set(port_sctq1r681.get() );
innerOut_sctq1r681.setUiAttribs({title:"glb File"});
port_sctq1r681.on("change", (a,v) => { innerOut_sctq1r681.set(a); });

const innerOut_s8gc9utlu = addedOps[i].outString("innerOut_s8gc9utlu");
innerOut_s8gc9utlu.set(port_s8gc9utlu.get() );
innerOut_s8gc9utlu.setUiAttribs({title:"File"});
port_s8gc9utlu.on("change", (a,v) => { innerOut_s8gc9utlu.set(a); });

const innerOut_1q0owu3w6 = addedOps[i].outString("innerOut_1q0owu3w6");
innerOut_1q0owu3w6.set(port_1q0owu3w6.get() );
innerOut_1q0owu3w6.setUiAttribs({title:"File"});
port_1q0owu3w6.on("change", (a,v) => { innerOut_1q0owu3w6.set(a); });

const innerOut_hs0fvs2ks = addedOps[i].outString("innerOut_hs0fvs2ks");
innerOut_hs0fvs2ks.set(port_hs0fvs2ks.get() );
innerOut_hs0fvs2ks.setUiAttribs({title:"File"});
port_hs0fvs2ks.on("change", (a,v) => { innerOut_hs0fvs2ks.set(a); });

    }
if(addedOps[i].innerOutput)
{
}
}
};

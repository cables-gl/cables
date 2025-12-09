const port_13yb9bb9g=op.inString("13yb9bb9g","hello who are you?");
port_13yb9bb9g.setUiAttribs({title:"Prompt",});
port_13yb9bb9g.setUiAttribs({"values":[""]});
port_13yb9bb9g.setUiAttribs({"display":"text"});

const port_v55wa68l8=op.inString("v55wa68l8","openai/gpt-oss-20b:free");
port_v55wa68l8.setUiAttribs({title:"Value",});
port_v55wa68l8.setUiAttribs({"values":[""]});

const port_axcfzi4h8=op.inString("axcfzi4h8","https://openrouter.ai/api");
port_axcfzi4h8.setUiAttribs({title:"API URL",});
port_axcfzi4h8.setUiAttribs({"values":[""]});

const port_qbpj78fjk=op.inString("qbpj78fjk","Bearer sk-XXXXXXXXXXXX");
port_qbpj78fjk.setUiAttribs({title:"Authentication",});
port_qbpj78fjk.setUiAttribs({"values":[""]});

const port_864u0eigc=op.inTrigger("864u0eigc");
port_864u0eigc.setUiAttribs({title:"Run",display:"button",});
port_864u0eigc.setUiAttribs({"values":[""]});

const port_gdgnnalkl=op.inFloat("gdgnnalkl",0);
port_gdgnnalkl.setUiAttribs({title:"Auto request",display:"bool",});
port_gdgnnalkl.setUiAttribs({"values":[""]});

const port_4sn5cnszp=op.outString("4sn5cnszp");
port_4sn5cnszp.setUiAttribs({title:"Result",});

const port_i4feefw9n=op.outObject("i4feefw9n");
port_i4feefw9n.setUiAttribs({title:"Result Object",});

const port_klu6r35ga=op.outNumber("klu6r35ga");
port_klu6r35ga.setUiAttribs({title:"Is Loading",display:"boolnum",});

const port_xs18z73z0=op.outNumber("xs18z73z0");
port_xs18z73z0.setUiAttribs({title:"Has Error",display:"boolnum",});

const port_aosval1gx=op.outString("aosval1gx");
port_aosval1gx.setUiAttribs({title:"Error",});

op.initInnerPorts=function(addedOps)
{
  for(let i=0;i<addedOps.length;i++)
  {
    if(addedOps[i].innerInput)
    {
const innerOut_13yb9bb9g = addedOps[i].outString("innerOut_13yb9bb9g");
innerOut_13yb9bb9g.set(port_13yb9bb9g.get() );
innerOut_13yb9bb9g.setUiAttribs({title:"Prompt"});
port_13yb9bb9g.on("change", (a,v) => { innerOut_13yb9bb9g.set(a); });

const innerOut_v55wa68l8 = addedOps[i].outString("innerOut_v55wa68l8");
innerOut_v55wa68l8.set(port_v55wa68l8.get() );
innerOut_v55wa68l8.setUiAttribs({title:"Value"});
port_v55wa68l8.on("change", (a,v) => { innerOut_v55wa68l8.set(a); });

const innerOut_axcfzi4h8 = addedOps[i].outString("innerOut_axcfzi4h8");
innerOut_axcfzi4h8.set(port_axcfzi4h8.get() );
innerOut_axcfzi4h8.setUiAttribs({title:"API URL"});
port_axcfzi4h8.on("change", (a,v) => { innerOut_axcfzi4h8.set(a); });

const innerOut_qbpj78fjk = addedOps[i].outString("innerOut_qbpj78fjk");
innerOut_qbpj78fjk.set(port_qbpj78fjk.get() );
innerOut_qbpj78fjk.setUiAttribs({title:"Authentication"});
port_qbpj78fjk.on("change", (a,v) => { innerOut_qbpj78fjk.set(a); });

const innerOut_864u0eigc = addedOps[i].outTrigger("innerOut_864u0eigc");
innerOut_864u0eigc.setUiAttribs({title:"Run"});
port_864u0eigc.onTriggered = () => { innerOut_864u0eigc.trigger(); };

const innerOut_gdgnnalkl = addedOps[i].outNumber("innerOut_gdgnnalkl");
innerOut_gdgnnalkl.set(port_gdgnnalkl.get() );
innerOut_gdgnnalkl.setUiAttribs({title:"Auto request"});
port_gdgnnalkl.on("change", (a,v) => { innerOut_gdgnnalkl.set(a); });

    }
if(addedOps[i].innerOutput)
{
const innerIn_4sn5cnszp = addedOps[i].inString("innerIn_4sn5cnszp");
innerIn_4sn5cnszp.setUiAttribs({title:"Result"});
innerIn_4sn5cnszp.on("change", (a,v) => { port_4sn5cnszp.set(a); });

const innerIn_i4feefw9n = addedOps[i].inObject("innerIn_i4feefw9n");
innerIn_i4feefw9n.setUiAttribs({title:"Result Object"});
innerIn_i4feefw9n.on("change", (a,v) => { port_i4feefw9n.setRef(a); });

const innerIn_klu6r35ga = addedOps[i].inFloat("innerIn_klu6r35ga");
innerIn_klu6r35ga.setUiAttribs({title:"Is Loading"});
innerIn_klu6r35ga.on("change", (a,v) => { port_klu6r35ga.set(a); });

const innerIn_xs18z73z0 = addedOps[i].inFloat("innerIn_xs18z73z0");
innerIn_xs18z73z0.setUiAttribs({title:"Has Error"});
innerIn_xs18z73z0.on("change", (a,v) => { port_xs18z73z0.set(a); });

const innerIn_aosval1gx = addedOps[i].inString("innerIn_aosval1gx");
innerIn_aosval1gx.setUiAttribs({title:"Error"});
innerIn_aosval1gx.on("change", (a,v) => { port_aosval1gx.set(a); });

}
}
};

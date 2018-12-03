const
    varname=op.inString("Var Name"),
    r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'})),
    g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' })),
    b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));


var root = document.documentElement;

r.onChange=
    g.onChange=
    b.onChange=
    varname.onChange=update;

function toHex(c)
{
    c=(Math.floor(c*255));
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function update()
{
    const hex='#'+toHex(r.get())+toHex(g.get())+toHex(b.get());
    root.style.setProperty('--'+varname.get(), hex);
}

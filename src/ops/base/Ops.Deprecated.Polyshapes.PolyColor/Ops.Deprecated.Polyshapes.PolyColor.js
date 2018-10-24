op.name="PolyColor";

var pDefaultR=op.addInPort(new CABLES.Port(op,"default r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var pDefaultG=op.addInPort(new CABLES.Port(op,"default g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var pDefaultB=op.addInPort(new CABLES.Port(op,"default b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var pDefaultA=op.addInPort(new CABLES.Port(op,"default a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var pName=op.inValueString("name","paramname");
var pTitle=op.inValueString("title","something readable");
var pDescription=op.inValueString("description","");
var pTab=op.inValueString("tab","color");
var pOrder=op.inValueString("order","0");



var resultR=op.outValue("value r");
var resultG=op.outValue("value g");
var resultB=op.outValue("value b");
var resultA=op.outValue("value a",1);

pDefaultR.onChange=update;
pDefaultG.onChange=update;
pDefaultB.onChange=update;
pDefaultA.onChange=update;

this.setDefaultVars=function()
{
    op.patch.vars[pName.get()]=pDefault.get();
};

window.polyshapes=window.polyshapes||{};
window.polyshapes.polyvalues=window.polyshapes.polyvalues||[];
window.polyshapes.polyvalues.push(op);


this.updateVarValue=function()
{
    if(op.patch.vars[pName.get()]!==undefined)
    {
        resultR.set(op.patch.vars[pName.get()][0]);
        resultG.set(op.patch.vars[pName.get()][1]);
        resultB.set(op.patch.vars[pName.get()][2]);
    }

};


function update()
{
    resultR.set(pDefaultR.get());
    resultG.set(pDefaultG.get());
    resultB.set(pDefaultB.get());
    resultA.set(pDefaultA.get());
}
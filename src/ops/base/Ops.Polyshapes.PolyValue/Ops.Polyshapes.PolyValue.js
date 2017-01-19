op.name="PolyValue";

var pDefault=op.inValue("default",0);
var pMin=op.inValue("min",0);
var pMax=op.inValue("max",1);

var pName=op.inValueString("name","paramname");
var pTitle=op.inValueString("title","something readable");
var pDescription=op.inValueString("description","description");
var pTab=op.inValueString("tab","tab");
var pOrder=op.inValueString("order","0");

var pDisplay=op.inValueSelect("display",['slider','slider int','input'],"slider");
var result=op.outValue("value");

pDefault.onChange=update;


window.polyshapes=window.polyshapes||{};
window.polyshapes.polyvalues=window.polyshapes.polyvalues||[];
window.polyshapes.polyvalues.push(op);

window.polyshapes.updateParams=function()
{
    for(var i=0;i<window.polyshapes.polyvalues.length;i++)
    {
        window.polyshapes.polyvalues[i].updateVarValue();
    }
};

this.updateVarValue=function()
{
    if(op.patch.vars[pName.get()]!==undefined)
        result.set(op.patch.vars[pName.get()]);
};


function update()
{
    result.set(pDefault.get());
}
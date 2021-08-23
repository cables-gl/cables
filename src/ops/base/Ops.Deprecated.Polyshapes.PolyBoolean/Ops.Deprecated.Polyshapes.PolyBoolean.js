op.name="PolyBoolean";

var pDefault=op.inValueBool("default",true);

var pName=op.inValueString("name","paramname");
var pTitle=op.inValueString("title","something readable");
var pDescription=op.inValueString("description","");
var pTab=op.inValueString("tab","tab");
var pOrder=op.inValueString("order","0");

var result=op.outValue("value",pDefault.get());

pDefault.onChange=update;


this.updateVarValue=function()
{
    if(op.patch.vars[pName.get()]!==undefined)
        result.set(op.patch.vars[pName.get()]);
};


function update()
{
    result.set(pDefault.get());
}

window.polyshapes=window.polyshapes||{};
window.polyshapes.polyvalues=window.polyshapes.polyvalues||[];
window.polyshapes.polyvalues.push(op);

this.updateVarValue=function()
{
    if(op.patch.vars[pName.get()]!==undefined)
        result.set(op.patch.vars[pName.get()]);
};

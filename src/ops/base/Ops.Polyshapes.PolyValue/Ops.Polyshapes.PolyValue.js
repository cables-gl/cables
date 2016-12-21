op.name="PolyValue";

var pDefault=op.inValue("default",0);
var pName=op.inValueString("name","paramname");
var pTitle=op.inValueString("title","something readable");
var pDescription=op.inValueString("description","description");

var pDisplay=op.inValueSelect("display",['slider','input'],"slider");

var pMin=op.inValue("min",0);
var pMax=op.inValue("max",1);

var result=op.outValue("value");

pDefault.onChange=update;

this.setDefaultVars=function()
{
    op.patch.vars[pName.get()]=pDefault.get();
};

function update()
{
    result.set(pDefault.get());
}
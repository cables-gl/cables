op.name = "PolyBoolean";

let pDefault = op.inValueBool("default", true);

let pName = op.inValueString("name", "paramname");
let pTitle = op.inValueString("title", "something readable");
let pDescription = op.inValueString("description", "");
let pTab = op.inValueString("tab", "tab");
let pOrder = op.inValueString("order", "0");

let result = op.outValue("value", pDefault.get());

pDefault.onChange = update;

this.updateVarValue = function ()
{
    if (op.patch.vars[pName.get()] !== undefined)
        result.set(op.patch.vars[pName.get()]);
};

function update()
{
    result.set(pDefault.get());
}

window.polyshapes = window.polyshapes || {};
window.polyshapes.polyvalues = window.polyshapes.polyvalues || [];
window.polyshapes.polyvalues.push(op);

this.updateVarValue = function ()
{
    if (op.patch.vars[pName.get()] !== undefined)
        result.set(op.patch.vars[pName.get()]);
};

op.name = "PolyValue";

let pDefault = op.inValue("default", 0);
let pMin = op.inValue("min", 0);
let pMax = op.inValue("max", 1);

let pName = op.inValueString("name", "paramname");
let pTitle = op.inValueString("title", "something readable");
let pDescription = op.inValueString("description", "");
let pTab = op.inValueString("tab", "form");
let pOrder = op.inValueString("order", "0");

let pDisplay = op.inValueSelect("display", ["slider", "slider int", "input"], "slider");
let result = op.outValue("value");

pDefault.onChange = update;

window.polyshapes = window.polyshapes || {};
window.polyshapes.polyvalues = window.polyshapes.polyvalues || [];
window.polyshapes.polyvalues.push(op);

window.polyshapes.updateParams = function ()
{
    for (let i = 0; i < window.polyshapes.polyvalues.length; i++)
    {
        window.polyshapes.polyvalues[i].updateVarValue();
    }
};

this.updateVarValue = function ()
{
    if (op.patch.vars[pName.get()] !== undefined)
        result.set(op.patch.vars[pName.get()]);
};

function update()
{
    result.set(pDefault.get());
}

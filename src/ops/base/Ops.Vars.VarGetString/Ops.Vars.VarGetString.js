let val = op.outString("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "string", op.varName, val);

const minimize = op.inTriggerButton("Assign to port");
minimize.setUiAttribs({ "hidePort": true });
minimize.onTriggered = () =>
{
    console.log("text");
    for (let i = val.links.length - 1; i >= 0; i--)
    {
        const p = val.links[i].getOtherPort(val);

        val.links[i].remove();
        p.setVariable(op.varName.get());

    }
    op.patch.deleteOp(op.id);
};

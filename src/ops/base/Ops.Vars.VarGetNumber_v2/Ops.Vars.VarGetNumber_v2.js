const val = op.outNumber("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "number", op.varName, val);

const minimize = op.inTriggerButton("Minimize");
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

const
    trigger = op.inTriggerButton("Trigger"),
    val = op.inArray("Value", null),
    next = op.outTrigger("Next");

op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "array", val, op.varName, trigger, next);

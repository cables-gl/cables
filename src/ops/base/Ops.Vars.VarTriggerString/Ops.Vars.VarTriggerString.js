const
    trigger = op.inTriggerButton("Trigger"),
    val = op.inString("Value", "New String"),
    next = op.outTrigger("Next");

op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "string", val, op.varName, trigger, next);

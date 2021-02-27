const
    val = op.inString("Value", "New String"),
    trigger = op.inTriggerButton("Trigger");

op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "string", val, op.varName, trigger);

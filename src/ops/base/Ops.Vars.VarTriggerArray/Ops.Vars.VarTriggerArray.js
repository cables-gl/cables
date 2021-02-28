const
    val = op.inArray("Value", null),
    trigger = op.inTriggerButton("Trigger");

op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "array", val, op.varName,trigger);

const
    val = op.inObject("Value", null),
    trigger = op.inTriggerButton("Trigger");
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "object", val, op.varName,trigger);

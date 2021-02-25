const val = op.inValueFloat("Value", 0),
    trigger=op.inTriggerButton("Trigger");
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "number", val, op.varName,trigger);


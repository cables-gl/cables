const val = op.inObject("Value", null);
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "object", val, op.varName);

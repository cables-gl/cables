const val = op.inTexture("Value", null);
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "object", val, op.varName);

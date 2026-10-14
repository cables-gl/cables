const val = op.outTexture("Value");
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "object", op.varName, val);

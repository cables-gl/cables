const val = op.outArray("Value");
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "array", op.varName, val);

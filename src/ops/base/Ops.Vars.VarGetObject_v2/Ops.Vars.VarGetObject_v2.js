const val = op.outObject("Value");
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "object", op.varName, val);

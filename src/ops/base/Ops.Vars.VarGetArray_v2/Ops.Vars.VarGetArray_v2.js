const val = op.outArray("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "array", op.varName, val);

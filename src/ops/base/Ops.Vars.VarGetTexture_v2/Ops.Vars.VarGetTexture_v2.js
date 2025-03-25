const val = op.outTexture("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "object", op.varName, val);

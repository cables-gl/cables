var val=op.outValue("Value");
op.varName=op.inValueSelect("Variable",[],"",true);



new CABLES.VarGetOpWrapper(op,"number",op.varName,val);

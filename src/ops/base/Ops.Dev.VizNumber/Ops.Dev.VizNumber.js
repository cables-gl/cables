const
    inTex = op.inFloat("Number In"),
    outTex = op.outNumber("Number Out");

op.setUiAttrib({ "height": 150 });

inTex.onChange = () => { outTex.set(inTex.get()); };

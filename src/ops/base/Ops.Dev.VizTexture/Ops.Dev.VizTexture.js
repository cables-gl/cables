const
    inTex = op.inTexture("Texture In"),
    outTex = op.outTexture("Texture Out");

op.setUiAttrib({ "height": 150 });

inTex.onChange = () => { outTex.set(inTex.get()); };

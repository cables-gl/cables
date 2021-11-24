const
    inTex = op.inTexture("Texture In"),
    outTex = op.outTexture("Texture Out");

// op.setUiAttrib({ "height": 350, "width": 350 });

inTex.onChange = () => { outTex.set(inTex.get()); };

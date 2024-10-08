const
    inR = op.inFloatSlider("R", 0),
    inG = op.inFloatSlider("G", 0),
    inB = op.inFloatSlider("B", 0),
    outLum = op.outNumber("Luminance");

inR.setUiAttribs({ "colorPick": true });

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
    // outLum.set( (0.2126 * inR.get()) + (0.7152 * inG.get()) + (0.0722 * inB.get()));
    // outLum.set( (0.299 * inR.get()) + (0.587 * inG.get()) + (0.114 * inB.get())); // percieved

    // outLum.set( Math.sqrt( 0.299*inR.get()*inR.get() + 0.587*inG.get()*inG.get() + 0.114*inB.get()*inB.get() )); // percieved 2

    outLum.set(chroma(inR.get() * 255, inG.get() * 255, inB.get() * 255, "rgb").luminance());
};

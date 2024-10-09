// https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o

const
    inR1 = op.inFloat("R 1", 0),
    inG1 = op.inFloat("G 1", 0),
    inB1 = op.inFloat("B 1", 0),
    inR2 = op.inFloat("R 2", 0),
    inG2 = op.inFloat("G 2", 0),
    inB2 = op.inFloat("B 2", 0),
    result = op.outNumber("Contrast");

inR1.onChange =
inG1.onChange =
inB1.onChange =
inR2.onChange =
inG2.onChange =
inB2.onChange =
 () =>
 {
     result.set(
         chroma.contrast(
             chroma(inR1.get() * 255, inG1.get() * 255, inB1.get() * 255, "rgb"),
             chroma(inR2.get() * 255, inG2.get() * 255, inB2.get() * 255, "rgb"))
     );
 };

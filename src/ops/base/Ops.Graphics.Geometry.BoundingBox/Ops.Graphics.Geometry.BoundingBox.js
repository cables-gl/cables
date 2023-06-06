const
    inW = op.inFloat("Width", 1),
    inH = op.inFloat("Height", 1),
    inD = op.inFloat("Depth", 1),
    result = op.outObject("Result");

inW.onChange =
inH.onChange =
inD.onChange = update;
update();

function update()
{
    result.set(
        {
            "_max": [inW.get() / 2, inH.get() / 2, inD.get() / 2],
            "_min": [-inW.get() / 2, -inH.get() / 2, -inD.get() / 2],
            "_center": [0, 0, 0]
        });
}

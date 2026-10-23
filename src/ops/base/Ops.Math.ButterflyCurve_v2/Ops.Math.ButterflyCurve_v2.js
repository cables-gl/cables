const
    inVal = op.inFloat("Value"),
    inWaveAmount = op.inFloat("Wave Amount", 2),
    inWaveFrequency = op.inFloat("Wave Frequency", 4),
    inPower = op.inFloat("Power", 1),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

op.setPortGroup("Shape", [inWaveAmount, inWaveFrequency, inPower]);

inVal.onChange =
    inWaveAmount.onChange =
    inWaveFrequency.onChange =
    inPower.onChange = update;
update();

function update()
{
    const t = inVal.get();
    let radius = Math.exp(Math.cos(t)) - inWaveAmount.get() * Math.cos(inWaveFrequency.get() * t) - Math.pow(Math.sin(t / 12), 5);
    radius = Math.sign(radius) * Math.pow(Math.abs(radius), inPower.get());

    outX.set(Math.sin(t) * radius);
    outY.set(Math.cos(t) * radius);
}

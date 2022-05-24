const
    inX=op.inFloat("Value",0),
    inGain=op.inFloatSlider("Gain",0.5),
    inBias=op.inFloatSlider("Bias",0.5),
    result=op.outNumber("Result");

inX.onChange=
inBias.onChange=
inGain.onChange=getGain;

function getBias(x,bias)
{
    const r= x / ((1 / bias - 2) * (1 - x) + 1);
    return r;
}

function getGain()
{
    const gain=inGain.get();
    const x=inX.get();
    let r= x < 0.5 ? getBias(x * 2.0, gain)/2.0 : getBias(x * 2.0 - 1.0,1.0 - gain)/2.0 + 0.5;

    r=getBias(r,inBias.get());


    result.set(r);

}



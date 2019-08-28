const
    inValue=op.inFloat("Number",0.5),
    inIdx=op.inInt("Index",0),
    outValue=op.outNumber("Result");

 inIdx.onChange=inValue.onChange = update;

function update()
{
    const idx=inIdx.get();
    const val=inValue.get();

    if(idx<Math.floor(val)) outValue.set(1.0);
    else if(idx>Math.ceil(val)) outValue.set(0.0);
    else outValue.set(val-Math.floor(val));
}
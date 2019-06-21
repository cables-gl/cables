const
    data=op.inObject("data"),
    key=op.inString("key"),
    result=op.outArray("result"),
    arrLength=op.outValue("Length");

result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;

data.onChange=
    key.onChange=update;

function update()
{
    const dat=data.get();
    const k=key.get();
    if(dat && dat.hasOwnProperty(k))
    {
        result.set(dat[k]);
        arrLength.set(result.get().length);
    }
}

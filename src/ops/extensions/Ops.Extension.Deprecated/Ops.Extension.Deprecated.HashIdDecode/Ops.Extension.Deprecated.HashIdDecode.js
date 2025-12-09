const
    inStr = op.inValueString("HashId"),
    result = op.outArray("Result");

let hashids = new Hashids("cablesalt");

inStr.onChange = function ()
{
    let arr = hashids.decode(inStr.get());
    result.set(arr);
};

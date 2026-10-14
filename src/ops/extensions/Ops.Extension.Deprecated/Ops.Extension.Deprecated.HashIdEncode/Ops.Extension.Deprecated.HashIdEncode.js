const
    inArr = op.inArray("Numbers"),
    result = op.outNumber("Result"),
    hashids = new Hashids("cablesalt");

inArr.onChange = function ()
{
    const id = hashids.encode(inArr.get());
    result.set(id);
};

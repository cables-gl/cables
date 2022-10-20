let inArr = op.inArray("Numbers");
let result = op.outValue("Result");
let hashids = new Hashids("cablesalt");

inArr.onChange = function ()
{
    let id = hashids.encode(inArr.get());
    result.set(id);
};

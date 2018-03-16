var inArr=op.inArray("Numbers");
var result=op.outValue("Result");
var hashids = new Hashids("cablesalt");

inArr.onChange=function()
{
    var id = hashids.encode(inArr.get());
    result.set(id);

};
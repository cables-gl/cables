
var inStr=op.inValueString("HashId");
var result=op.outArray("Result");

var hashids = new Hashids("cablesalt");

inStr.onChange=function()
{
    var arr = hashids.decode(inStr.get());
    result.set(arr);

};
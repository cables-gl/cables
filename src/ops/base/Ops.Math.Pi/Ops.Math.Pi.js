const multiply = op.inValueFloat("Multiply amount",1.0);
// var p=op.outValue("Pi",Math.PI);
var p=op.outValue("Pi",Math.PI);

multiply.onChange = function ()
{
    p.setValue(Math.PI * multiply.get());
}

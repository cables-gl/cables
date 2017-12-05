
var chars=op.inValueString("chars","cables");
var len=op.inValueInt("Length",10);

var generate=op.inFunctionButton("Generate");

var result=op.outValue("Result");

generate.onTriggered=gen;
gen();

function gen()
{
    var numChars=chars.get().length-1;
    var str='';
    for(var i=0;i<Math.abs(len.get());i++)
    {
        str+=chars.get()[Math.round(Math.random()*numChars)];
    }
    
    result.set(str);
    
}
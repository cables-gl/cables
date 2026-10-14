
var chars=op.inValueString("chars","cables");
var len=op.inInt("Length",10);

var generate=op.inTriggerButton("Generate");

var result=op.outNumber("Result");

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
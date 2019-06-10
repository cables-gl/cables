const
    chars=op.inString("chars","cables"),
    len=op.inValueInt("Length",10),
    generate=op.inTriggerButton("Generate"),
    result=op.outString("Result");

generate.onTriggered=gen;
gen();

function gen()
{
    var numChars=chars.get().length-1;
    var str='';
    for(var i=0;i<Math.abs(len.get());i++)
        str+=chars.get()[Math.round(Math.random()*numChars)];

    result.set(str);
}
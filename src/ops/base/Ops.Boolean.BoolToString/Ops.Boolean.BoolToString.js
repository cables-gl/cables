const
    inBool=op.inBool("Boolean",false),
    inTrue=op.inString("True","true"),
    inFalse=op.inString("False","false"),
    result=op.outString("String","false");

inTrue.onChange=
    inFalse.onChange=
    inBool.onChange=update

function update()
{
    if(inBool.get()) result.set(inTrue.get());
    else result.set(inFalse.get());
}
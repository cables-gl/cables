const
    inBool=op.inValueBool("Boolean"),
    inStrTrue=op.inString("True","Yes"),
    inStrFalse=op.inString("False","No"),
    result=op.outString("Result");

inBool.onChange=
inStrFalse.onChange=
inStrTrue.onChange=update;

function update()
{
    if(inBool.get())result.set(inStrTrue.get());
        else result.set(inStrFalse.get());
}

update();
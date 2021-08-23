const
    inArr=op.inArray("Array"),
    inSeperator=op.inString("Seperator",","),
    inNewLine=op.inValueBool("New Line"),
    outStr=op.outString("Result");

inArr.onChange=
    outStr.onChange=
    inSeperator.onChange=
    inNewLine.onChange=exec;


function exec()
{
    var arr=inArr.get();
    var result='';

    var sep=inSeperator.get();
    if(inNewLine.get())sep+='\n';

    if(arr && arr.join)
    {
        result=arr.join(sep);
    }

    outStr.set(result);
}